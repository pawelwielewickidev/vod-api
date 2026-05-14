package com.pawel.vod_api.dto;

import java.time.LocalDateTime;

public record PlaybackProgressResponseDto(
        Long id,
        Long profileId,
        Long episodeId,
        Long movieId,
        String movieTitle,
        String episodeTitle,
        Integer episodeNumber,
        Integer timestampSeconds,
        boolean completed,
        LocalDateTime updatedAt
) {
}