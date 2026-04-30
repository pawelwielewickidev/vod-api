package com.pawel.vod_api.config;

import com.pawel.vod_api.repository.MovieRepository;
import com.pawel.vod_api.service.TmdbAnimeImportService; // <--- Twój nowy serwis
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final TmdbAnimeImportService tmdbAnimeImportService;
    private final MovieRepository movieRepository;

    @Override
    public void run(String... args) throws Exception {
        if (movieRepository.count() == 0) {
            log.info("Baza anime jest pusta. Rozpoczynam pobieranie danych z TMDB...");
            tmdbAnimeImportService.importPopularAnime();
            log.info("Pomyślnie zaimportowano popularne anime!");
        } else {
            log.info("Anime znajdują się już w bazie.");
        }
    }
}