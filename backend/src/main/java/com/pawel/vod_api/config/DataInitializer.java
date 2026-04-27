package com.pawel.vod_api.config;

import com.pawel.vod_api.repository.MovieRepository;
import com.pawel.vod_api.service.JikanImportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final JikanImportService jikanImportService;
    private final MovieRepository movieRepository;

    @Override
    public void run(String... args) throws Exception {

        if (movieRepository.count() < 20) {
            log.info("Baza filmów jest pusta. Rozpoczynam pobieranie danych z Jikan API...");

            try {
                jikanImportService.importData();
                log.info("Pomyślnie zaimportowano anime z Jikan API!");
            } catch (Exception e) {
                log.error("Wystąpił błąd podczas importu z Jikan: ", e);
            }

        } else {
            log.info("Filmy znajdują się już w bazie. Pomijam import z Jikan API.");
        }
    }
}
