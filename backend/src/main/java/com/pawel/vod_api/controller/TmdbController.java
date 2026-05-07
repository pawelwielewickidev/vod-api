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

    // Przykłady w przeglądarce:
    // http://localhost:8080/api/tmdb/import?category=Anime Akcja&genreId=10759
    // http://localhost:8080/api/tmdb/import?category=Anime Fantasy&genreId=10765
    // http://localhost:8080/api/tmdb/import?category=Anime Komedia&genreId=35

    @GetMapping("/import")
    public ResponseEntity<String> importAnime(@RequestParam String category, @RequestParam String genreId) {
        new Thread(() -> tmdbService.importAnimeByCategory(category, genreId)).start();
        return ResponseEntity.ok("Rozpoczęto import kategorii: " + category + " w tle. Sprawdź konsole w środowisku programistycznym!");
    }

    @GetMapping("/import/popular")
    public ResponseEntity<String> importPopular() {
        new Thread(tmdbService::importPopularAnime).start();
        return ResponseEntity.ok("Rozpoczęto import popularnych anime w tle. Sprawdź konsole!");
    }
}