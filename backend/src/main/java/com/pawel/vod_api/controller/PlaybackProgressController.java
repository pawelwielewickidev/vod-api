package com.pawel.vod_api.controller;

import com.pawel.vod_api.dto.PlaybackProgressRequestDto;
import com.pawel.vod_api.dto.PlaybackProgressResponseDto;
import com.pawel.vod_api.service.PlaybackProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/profiles/{profileId}/playback-progress")
@RequiredArgsConstructor
public class PlaybackProgressController {

    private final PlaybackProgressService playbackProgressService;

    @PutMapping("/episodes/{episodeId}")
    public ResponseEntity<PlaybackProgressResponseDto> saveOrUpdateProgress(
            @PathVariable Long userId,
            @PathVariable Long profileId,
            @PathVariable Long episodeId,
            @RequestBody PlaybackProgressRequestDto request
    ) {
        PlaybackProgressResponseDto response = playbackProgressService.saveOrUpdateProgress(
                userId,
                profileId,
                episodeId,
                request
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/episodes/{episodeId}")
    public ResponseEntity<PlaybackProgressResponseDto> getProgress(
            @PathVariable Long userId,
            @PathVariable Long profileId,
            @PathVariable Long episodeId
    ) {
        PlaybackProgressResponseDto response = playbackProgressService.getProgress(
                userId,
                profileId,
                episodeId
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<PlaybackProgressResponseDto>> getProfileProgress(
            @PathVariable Long userId,
            @PathVariable Long profileId
    ) {
        List<PlaybackProgressResponseDto> response = playbackProgressService.getProfileProgress(
                userId,
                profileId
        );

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/episodes/{episodeId}")
    public ResponseEntity<Void> deleteProgress(
            @PathVariable Long userId,
            @PathVariable Long profileId,
            @PathVariable Long episodeId
    ) {
        playbackProgressService.deleteProgress(userId, profileId, episodeId);

        return ResponseEntity.noContent().build();
    }
}