package com.pawel.vod_api.service;

import com.pawel.vod_api.dto.tmdb.TmdbAnimeDto;
import com.pawel.vod_api.dto.tmdb.TmdbAnimeResponseDto;
import com.pawel.vod_api.dto.tmdb.TmdbEpisodeDto;
import com.pawel.vod_api.dto.tmdb.TmdbImagesResponse;
import com.pawel.vod_api.dto.tmdb.TmdbSeasonResponse;
import com.pawel.vod_api.model.Category;
import com.pawel.vod_api.model.Episode;
import com.pawel.vod_api.model.Movie;
import com.pawel.vod_api.repository.CategoryRepository;
import com.pawel.vod_api.repository.EpisodeRepository;
import com.pawel.vod_api.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
@RequiredArgsConstructor
public class TmdbAnimeImportService {

    private final MovieRepository movieRepository;
    private final CategoryRepository categoryRepository;
    private final EpisodeRepository episodeRepository;
    private final RestTemplate restTemplate;
    private final AiEnrichmentService aiEnrichmentService;

    // ŚLUZA BEZPIECZEŃSTWA
    private final AtomicBoolean isImportRunning = new AtomicBoolean(false);

    @Value("${tmdb.api.key}")
    private String tmdbApiKey;

    @Transactional
    public void importPopularAnime() {
        importAnimeByCategory("Popularne Anime", "16");
    }

    @Transactional
    public void importAnimeByCategory(String categoryName, String tmdbGenreId) {

        if (!isImportRunning.compareAndSet(false, true)) {
            System.out.println("⚠️ UWAGA: Import już trwa! Zignorowano żądanie.");
            return;
        }

        try {
            String genresParam = tmdbGenreId.equals("16") ? "16" : "16," + tmdbGenreId;

            String url = "https://api.themoviedb.org/3/discover/tv?api_key=" + tmdbApiKey +
                    "&language=en-US&with_original_language=ja&with_genres=" + genresParam +
                    "&sort_by=popularity.desc&page=1";

            System.out.println("⛩️ Rozpoczynam pobieranie TMDB dla kategorii: " + categoryName + "...");

            TmdbAnimeResponseDto response = restTemplate.getForObject(url, TmdbAnimeResponseDto.class);

            if (response != null && response.results() != null) {

                Category category = categoryRepository.findByName(categoryName)
                        .orElseGet(() -> {
                            Category newCategory = new Category();
                            newCategory.setName(categoryName);
                            return categoryRepository.save(newCategory);
                        });

                for (TmdbAnimeDto dto : response.results()) {

                    Movie movieToSave = null;
                    boolean isNew = false;

                    if (dto.id() != null) {
                        movieToSave = movieRepository.findByTmdbId(Long.valueOf(dto.id())).orElse(null);
                    }
                    if (movieToSave == null && dto.name() != null) {
                        List<Movie> existingMovies = movieRepository.findByNormalizedTitle(dto.name());
                        if (!existingMovies.isEmpty()) {
                            movieToSave = existingMovies.get(0);
                        }
                    }

                    if (movieToSave == null) {
                        movieToSave = new Movie();
                        movieToSave.setTitle(dto.name());
                        isNew = true;
                    }

                    if (dto.id() != null) {
                        movieToSave.setTmdbId(Long.valueOf(dto.id()));
                    }

                    if (dto.posterPath() != null) {
                        movieToSave.setThumbnailPath("https://image.tmdb.org/t/p/w500" + dto.posterPath());
                    }
                    if (dto.backdropPath() != null) {
                        movieToSave.setBackgroundPath("https://image.tmdb.org/t/p/original" + dto.backdropPath());
                    }

                    if (dto.firstAirDate() != null && dto.firstAirDate().length() >= 4) {
                        try {
                            movieToSave.setReleaseDate(Integer.parseInt(dto.firstAirDate().substring(0, 4)));
                        } catch (NumberFormatException e) {
                            if(isNew) movieToSave.setReleaseDate(0);
                        }
                    } else if (isNew) {
                        movieToSave.setReleaseDate(0);
                    }

                    movieToSave.setCategory(category);

                    // MĄDRE WZBOGACANIE AI (Działa na pełnej szybkości, bez sztucznego czekania!)
                    if (movieToSave.getTags() == null || movieToSave.getTags().trim().isEmpty()) {

                        System.out.println("🤖 Wzbogacam AI dla: " + movieToSave.getTitle());
                        AiEnrichmentService.AiResult aiResult = aiEnrichmentService.enrichContent(dto.name(), dto.overview());

                        if (aiResult.tags() != null) {
                            String desc = aiResult.description();
                            if (desc != null && desc.length() > 2400) {
                                desc = desc.substring(0, 2397) + "...";
                            }
                            movieToSave.setDescription(desc);
                            movieToSave.setTags(aiResult.tags());
                        } else {
                            System.out.println("⏭️ AI nie zwróciło danych. Zapisuję film bez tagów, by spróbować później.");
                        }
                    }

                    if (dto.id() != null && movieToSave.getLogoPath() == null) {
                        String imagesUrl = "https://api.themoviedb.org/3/tv/" + dto.id() + "/images?api_key=" + tmdbApiKey + "&include_image_language=en,ja,xx,null";
                        try {
                            TmdbImagesResponse imagesResp = restTemplate.getForObject(imagesUrl, TmdbImagesResponse.class);
                            if (imagesResp != null && imagesResp.logos() != null && !imagesResp.logos().isEmpty()) {
                                String logo = imagesResp.logos().get(0).filePath();
                                movieToSave.setLogoPath("https://image.tmdb.org/t/p/original" + logo);
                            }
                        } catch (Exception e) {
                            System.err.println("⚠️ Nie udało się pobrać loga dla: " + dto.name());
                        }
                    }

                    Movie savedMovie = movieRepository.save(movieToSave);

                    if (isNew) {
                        System.out.println("✅ Dodano NOWE anime: " + savedMovie.getTitle());
                    } else {
                        System.out.println("🔄 Zaktualizowano (PATCH): " + savedMovie.getTitle());
                    }

                    if (savedMovie.getTmdbId() != null) {
                        fetchAndSaveEpisodes(savedMovie);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Błąd podczas importu z TMDB: " + e.getMessage());
            e.printStackTrace();
        } finally {
            isImportRunning.set(false);
            System.out.println("🏁 Import zakończony. Śluza zwolniona.");
        }
    }

    private void fetchAndSaveEpisodes(Movie movie) {
        String episodesUrl = "https://api.themoviedb.org/3/tv/" + movie.getTmdbId() + "/season/1?api_key=" + tmdbApiKey + "&language=pl-PL";

        try {
            TmdbSeasonResponse seasonResponse = restTemplate.getForObject(episodesUrl, TmdbSeasonResponse.class);

            if (seasonResponse != null && seasonResponse.episodes() != null) {
                int count = 0;
                for (TmdbEpisodeDto epDto : seasonResponse.episodes()) {
                    if (!episodeRepository.existsByMovieIdAndEpisodeNumber(movie.getId(), epDto.episodeNumber())) {
                        Episode episode = new Episode();
                        episode.setEpisodeNumber(epDto.episodeNumber());
                        episode.setTitle(epDto.name());
                        episode.setMovie(movie);

                        episodeRepository.save(episode);
                        count++;
                    }
                }
                if (count > 0) {
                    System.out.println("   📺 Dopisano " + count + " nowych odcinków do bazy.");
                }
            }
        } catch (Exception e) {
            // Ciche ignorowanie
        }
    }
}