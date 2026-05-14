package com.pawel.vod_api.dto;

public record PlaybackProgressRequestDto(
        Integer timestampSeconds,
        boolean completed
) {
}