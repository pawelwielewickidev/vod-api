package com.pawel.vod_api.controller;


import com.pawel.vod_api.dto.EmbedUpdateDto;
import com.pawel.vod_api.model.Episode;
import com.pawel.vod_api.repository.EpisodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/episodes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Pozwala botowi na swobodne połączenie
public class EpisodeBotController {

    private final EpisodeRepository episodeRepository;

    // 1. Bot pobiera listę zadań
    @GetMapping(value = "/todo/{movieId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Episode> getEpisodesToProcess(@PathVariable Long movieId) {
        return episodeRepository.findByMovieIdAndShindenUrlIsNotNullAndSourceEmbedUrlIsNullOrderByEpisodeNumberAsc(movieId);
    }

    // 2. Bot wysyła znaleziony link
    @PutMapping("/{id}/embed")
    public ResponseEntity<?> updateEmbedUrl(@PathVariable Long id, @RequestBody EmbedUpdateDto update) {
        return episodeRepository.findById(id).map(episode -> {
            episode.setSourceEmbedUrl(update.getSourceEmbedUrl());
            episodeRepository.save(episode);
            System.out.println("✅ Zaktualizowano embed dla odcinka: " + episode.getTitle());
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
    @GetMapping("/missing-urls/{movieId}")
    public List<Episode> getMissingShindenUrls(@PathVariable Long movieId) {
        return episodeRepository.findByMovieIdAndShindenUrlIsNullOrderByEpisodeNumberAsc(movieId);
    }
    @PutMapping("/{id}/shinden-url")
    public ResponseEntity<?> updateShindenUrl(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return episodeRepository.findById(id).map(episode -> {
            episode.setShindenUrl(body.get("shindenUrl"));
            episodeRepository.save(episode);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}