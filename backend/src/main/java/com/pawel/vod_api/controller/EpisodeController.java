package com.pawel.vod_api.controller;



import com.pawel.vod_api.dto.EpisodeDto;
import com.pawel.vod_api.dto.WatchdogEpisodeDto;
import com.pawel.vod_api.service.EpisodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/episodes")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class EpisodeController {

    private final EpisodeService episodeService;

    @GetMapping("/{id}/stream")
    public ResponseEntity<Resource> streamEpisode(@PathVariable Long id) {
        Resource video = episodeService.getEpisodeVideo(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("video/mp4"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(video);
    }

    @PostMapping()
    public ResponseEntity<String> createEpisode(@RequestBody EpisodeDto request) {
        episodeService.addEpisode(request);
        return ResponseEntity.ok("Odcinek został pomyślnie dodany!");
    }
    @GetMapping
    public ResponseEntity<List<WatchdogEpisodeDto>> getAllEpisodes() {
        return ResponseEntity.ok(episodeService.findAllAsDto());
    }
    @PutMapping("/{id}")
    public ResponseEntity<WatchdogEpisodeDto> updateEpisode(
            @PathVariable Long id,
            @RequestBody WatchdogEpisodeDto updateData) {

        WatchdogEpisodeDto updated = episodeService.partialUpdate(id, updateData);
        return ResponseEntity.ok(updated);
    }
    @PostMapping("/sync")
    public ResponseEntity<Void> syncEpisodes(@RequestBody Map<String, List<WatchdogEpisodeDto>> payload) {
        episodeService.syncDiscoveryData(payload.get("episodes"));
        return ResponseEntity.noContent().build();
    }
}
