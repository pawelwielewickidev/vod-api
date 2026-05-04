package com.pawel.vod_api.controller;


import com.pawel.vod_api.model.Movie;
import com.pawel.vod_api.repository.MovieRepository;
import com.pawel.vod_api.service.TmdbSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/sync")
@RequiredArgsConstructor
public class SyncController {

    private final TmdbSyncService tmdbSyncService;
    private final MovieRepository movieRepository;

    @PostMapping("/movie/{movieId}/episodes")
    public ResponseEntity<String> syncMovieEpisodes(
            @PathVariable Long movieId,
            @RequestParam(defaultValue = "1") int season) {


        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono serialu o ID: " + movieId));


        if (movie.getTmdbId() == null) {
            return ResponseEntity.badRequest().body("Błąd: To anime nie ma przypisanego 'tmdbId' w bazie!");
        }


        tmdbSyncService.syncEpisodesFromTmdb(movie.getTmdbId(), season, movie);

        return ResponseEntity.ok("Rozpoczęto synchronizację odcinków dla sezonu " + season + ". Sprawdź konsolę Spring Boota!");
    }
}
