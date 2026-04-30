package com.pawel.vod_api.service;

import com.pawel.vod_api.dto.jikan.JikanAnimeDto;
import com.pawel.vod_api.dto.jikan.JikanResponseDto;
import com.pawel.vod_api.dto.tmdb.TmdbImagesResponse;
import com.pawel.vod_api.dto.tmdb.TmdbResult;
import com.pawel.vod_api.dto.tmdb.TmdbSearchResponse;
import com.pawel.vod_api.model.Category;
import com.pawel.vod_api.model.Movie;
import com.pawel.vod_api.repository.CategoryRepository;
import com.pawel.vod_api.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriUtils;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class JikanImportService {
    private final MovieRepository movieRepository;
    private final CategoryRepository categoryRepository;
    private final RestTemplate restTemplate;

    @Value("${tmdb.api.key}")
    private String tmdbApiKey;

    @SneakyThrows
    @Transactional
    public void importData() {
        //String jikanUrl = "https://api.jikan.moe/v4/top/anime";
        String jikanUrl = "https://api.jikan.moe/v4/top/manga";

        try {
            String rawJson = restTemplate.getForObject(jikanUrl, String.class);
            System.out.println("⚠️ SUROWY TEKST OD JIKAN: " + rawJson);
            JikanResponseDto response = restTemplate.getForObject(jikanUrl, JikanResponseDto.class);

            System.out.println("🔍 --- DIAGNOSTYKA JIKAN ---");
            System.out.println("1. Czy odpowiedź to null? -> " + (response == null));
            if (response != null) {
                System.out.println("2. Czy 'data' to null? -> " + (response.data() == null));
                if (response.data() != null) {
                    System.out.println("3. Liczba pobranych anime: " + response.data().size());
                }
            }
            System.out.println("----------------------------");

            if (response != null && response.data() != null) {
                for (JikanAnimeDto dto : response.data()) {

                    if (!movieRepository.existsByTitle(dto.title())) {

                        Movie movie = new Movie();
                        movie.setTitle(dto.title());

                        String description = dto.synopsis();
                        if (description != null && description.length() > 1000) {
                            description = description.substring(0, 997) + "...";
                        }
                        movie.setDescription(description);

                        if (dto.images() != null && dto.images().jpg() != null) {
                            movie.setThumbnailPath(dto.images().jpg().large_image_url());
                        }

                        if (dto.year() != null) {
                            movie.setReleaseDate(dto.year());
                        } else {
                            movie.setReleaseDate(0);
                        }

                        if (dto.genres() != null && !dto.genres().isEmpty()) {
                            String genreName = dto.genres().get(0).name();
                            Category category = categoryRepository.findByName(genreName)
                                    .orElseGet(() -> {
                                        Category newCategory = new Category();
                                        newCategory.setName(genreName);
                                        return categoryRepository.save(newCategory);
                                    });
                            movie.setCategory(category);
                        } else {
                            Category defaultCategory = categoryRepository.findByName("Inne")
                                    .orElseGet(() -> {
                                        Category newCategory = new Category();
                                        newCategory.setName("Inne");
                                        return categoryRepository.save(newCategory);
                                    });
                            movie.setCategory(defaultCategory);
                        }

                        String finalBgPath = null;


                        try {
                            String encodedTitle = java.net.URLEncoder.encode(dto.title(), java.nio.charset.StandardCharsets.UTF_8);
                            String tmdbUrl = "https://api.themoviedb.org/3/search/multi?api_key=" + tmdbApiKey + "&query=" + encodedTitle;

                            TmdbSearchResponse tmdbResponse = restTemplate.getForObject(tmdbUrl, TmdbSearchResponse.class);

                            if (tmdbResponse != null && tmdbResponse.results() != null && !tmdbResponse.results().isEmpty()) {
                                for (TmdbResult result : tmdbResponse.results()) {
                                    if (result.backdropPath() != null) {

                                        finalBgPath = "https://image.tmdb.org/t/p/original" + result.backdropPath();
                                        System.out.println("💎 TMDB Backdrop dla " + dto.title() + " -> ZNALEZIONO");


                                        String mediaType = (result.mediaType() != null) ? result.mediaType() : "tv";
                                        Integer tmdbId = result.id();

                                        System.out.println("🔍 Szukam loga... TMDB ID: " + tmdbId + ", Typ: " + mediaType);

                                        if (tmdbId != null) {

                                            String imagesUrl = "https://api.themoviedb.org/3/" + mediaType + "/" + tmdbId + "/images?api_key=" + tmdbApiKey + "&include_image_language=en,ja,xx,null";

                                            try {
                                                TmdbImagesResponse imagesResp = restTemplate.getForObject(imagesUrl, TmdbImagesResponse.class);

                                                if (imagesResp != null && imagesResp.logos() != null) {
                                                    if (!imagesResp.logos().isEmpty()) {
                                                        String logo = imagesResp.logos().get(0).filePath();
                                                        movie.setLogoPath("https://image.tmdb.org/t/p/original" + logo);
                                                        System.out.println("🌟 TMDB Logo DODANE -> " + logo);
                                                    } else {
                                                        System.out.println("⚠️ TMDB odpowiedziało, ale tablica 'logos' jest pusta dla tego anime.");
                                                    }
                                                }
                                            } catch (Exception e) {
                                                System.err.println("❌ Błąd połączenia z endpointem obrazków TMDB: " + e.getMessage());
                                            }
                                        } else {
                                            System.out.println("❌ BŁĄD DTO: tmdbId wynosi null! Jackson nie zmapował pola 'id'.");
                                        }

                                        break;
                                    }
                                }
                            }
                        } catch (Exception e) {
                            System.err.println("❌ Błąd głównego wyszukiwania TMDB dla " + dto.title() + ": " + e.getMessage());
                        }

                        if (finalBgPath == null && dto.trailer() != null) {
                            String ytId = dto.trailer().youtubeId();

                            if (ytId == null && dto.trailer().url() != null && dto.trailer().url().contains("?v=")) {
                                ytId = dto.trailer().url().split("\\?v=")[1].split("&")[0];
                            }

                            if (ytId == null && dto.trailer().embedUrl() != null && dto.trailer().embedUrl().contains("/embed/")) {
                                String[] parts = dto.trailer().embedUrl().split("/embed/");
                                if (parts.length > 1) {
                                    ytId = parts[1].split("\\?")[0];
                                }
                            }

                            if (ytId != null && !ytId.isEmpty()) {
                                finalBgPath = "https://img.youtube.com/vi/" + ytId + "/maxresdefault.jpg";
                                System.out.println("✅ YT Backdrop dla " + dto.title() + " -> " + finalBgPath);
                            }
                        }

                        if (finalBgPath == null && dto.images() != null && dto.images().jpg() != null) {
                            finalBgPath = dto.images().jpg().large_image_url();
                            System.out.println("⚠️ Plakat jako tło dla " + dto.title() + " -> " + finalBgPath);
                        }

                        movie.setBackgroundPath(finalBgPath);
                        movieRepository.save(movie);

                        Thread.sleep(500);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Krytyczny błąd podczas importu z API: " + e.getMessage());
            e.printStackTrace();
        }
    }


        }


