package com.pawel.vod_api.service;

import com.pawel.vod_api.dto.tmdb.TmdbAnimeDto;
import com.pawel.vod_api.dto.tmdb.TmdbAnimeResponseDto;
import com.pawel.vod_api.dto.tmdb.TmdbImagesResponse;
import com.pawel.vod_api.model.Category;
import com.pawel.vod_api.model.Movie;
import com.pawel.vod_api.repository.CategoryRepository;
import com.pawel.vod_api.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class TmdbAnimeImportService {

    private final MovieRepository movieRepository;
    private final CategoryRepository categoryRepository;
    private final RestTemplate restTemplate;

    @Value("${tmdb.api.key}")
    private String tmdbApiKey;

    // Domyślna metoda wywoływana przy starych importach
    @Transactional
    public void importPopularAnime() {
        importAnimeByCategory("Popularne Anime", "16"); // 16 to ogólny gatunek Animacja w TMDB
    }

    // Nowa, elastyczna metoda z tarczą anty-duplikatową
    @Transactional
    public void importAnimeByCategory(String categoryName, String tmdbGenreId) {

        // Łączymy "16" (Animacja) z podanym gatunkiem, żeby zawsze pobierać anime
        String genresParam = tmdbGenreId.equals("16") ? "16" : "16," + tmdbGenreId;

        String url = "https://api.themoviedb.org/3/discover/tv?api_key=" + tmdbApiKey +
                "&language=en-US&with_original_language=ja&with_genres=" + genresParam +
                "&sort_by=popularity.desc&page=1";

        System.out.println("⛩️ Rozpoczynam pobieranie: " + categoryName + " (Gatunki: " + genresParam + ")...");

        try {
            TmdbAnimeResponseDto response = restTemplate.getForObject(url, TmdbAnimeResponseDto.class);

            if (response != null && response.results() != null) {

                Category category = categoryRepository.findByName(categoryName)
                        .orElseGet(() -> {
                            Category newCategory = new Category();
                            newCategory.setName(categoryName);
                            return categoryRepository.save(newCategory);
                        });

                for (TmdbAnimeDto dto : response.results()) {

                    // --- TARCZA OBRONNA PRZED DUPLIKATAMI ---
                    boolean isDuplicate = false;

                    // 1. Sprawdzamy po TMDB ID (Absolutna pewność)
                    if (dto.id() != null && movieRepository.existsByTmdbId(Long.valueOf(dto.id()))) {
                        isDuplicate = true;
                        System.out.println("⏭️ Pomijam (ID TMDB już istnieje w bazie): " + dto.name());
                    }
                    // 2. Sprawdzamy po znormalizowanym tytule (Ignoruje spacje i duże/małe litery)
                    else if (dto.name() != null && movieRepository.existsByNormalizedTitle(dto.name())) {
                        isDuplicate = true;
                        System.out.println("⏭️ Pomijam (Podobny tytuł jest już w bazie): " + dto.name());
                    }

                    // Jeśli przeszedł przez tarcze, zapisujemy nowy film
                    if (!isDuplicate) {
                        Movie movie = new Movie();
                        movie.setTitle(dto.name());

                        if (dto.id() != null) {
                            movie.setTmdbId(Long.valueOf(dto.id()));
                        }

                        String desc = dto.overview();
                        if (desc != null && desc.length() > 1000) {
                            desc = desc.substring(0, 997) + "...";
                        }
                        movie.setDescription(desc);

                        if (dto.posterPath() != null) {
                            movie.setThumbnailPath("https://image.tmdb.org/t/p/w500" + dto.posterPath());
                        }
                        if (dto.backdropPath() != null) {
                            movie.setBackgroundPath("https://image.tmdb.org/t/p/original" + dto.backdropPath());
                        }

                        if (dto.firstAirDate() != null && dto.firstAirDate().length() >= 4) {
                            try {
                                movie.setReleaseDate(Integer.parseInt(dto.firstAirDate().substring(0, 4)));
                            } catch (NumberFormatException e) {
                                movie.setReleaseDate(0);
                            }
                        } else {
                            movie.setReleaseDate(0);
                        }

                        // --- POBIERANIE LOGA ---
                        if (dto.id() != null) {
                            String imagesUrl = "https://api.themoviedb.org/3/tv/" + dto.id() + "/images?api_key=" + tmdbApiKey + "&include_image_language=en,ja,xx,null";

                            try {
                                TmdbImagesResponse imagesResp = restTemplate.getForObject(imagesUrl, TmdbImagesResponse.class);

                                if (imagesResp != null && imagesResp.logos() != null && !imagesResp.logos().isEmpty()) {
                                    String logo = imagesResp.logos().get(0).filePath();
                                    movie.setLogoPath("https://image.tmdb.org/t/p/original" + logo);
                                }
                            } catch (Exception e) {
                                System.err.println("⚠️ Nie udało się pobrać loga dla: " + dto.name());
                            }
                        }
                        // ---------------------------------

                        movie.setCategory(category);
                        movieRepository.save(movie);

                        System.out.println("✅ Zapisano anime: " + dto.name() + (movie.getLogoPath() != null ? " (z logiem 🌟)" : ""));
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Krytyczny błąd podczas importu Anime z TMDB: " + e.getMessage());
            e.printStackTrace();
        }
    }
}