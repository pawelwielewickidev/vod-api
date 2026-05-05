package com.pawel.vod_api.controller;

import com.pawel.vod_api.service.TmdbAnimeImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tmdb")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TmdbController {

    private final TmdbAnimeImportService tmdbService;

    // Pobiera konkretny gatunek. Użycie w przeglądarce:
    // http://localhost:8080/api/tmdb/import?category=Anime Fantasy&genreId=10765
    @GetMapping("/import")
    public ResponseEntity<String> importAnime(@RequestParam String category, @RequestParam String genreId) {
        tmdbService.importAnimeByCategory(category, genreId);
        return ResponseEntity.ok("Rozpoczęto import kategorii: " + category + " dla ID TMDB: " + genreId + ". Sprawdź konsole w poszukiwaniu logów!");
    }

    // Domyślny szybki strzał po topowe anime
    @GetMapping("/import/popular")
    public ResponseEntity<String> importPopular() {
        tmdbService.importPopularAnime();
        return ResponseEntity.ok("Rozpoczęto import popularnych anime. Sprawdź konsole w poszukiwaniu logów!");
    }
}