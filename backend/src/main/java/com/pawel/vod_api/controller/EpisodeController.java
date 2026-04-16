package com.pawel.vod_api.controller;



import com.pawel.vod_api.dto.EpisodeDto;
import com.pawel.vod_api.service.EpisodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
