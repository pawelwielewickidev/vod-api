package com.pawel.vod_api.dto.tmdb;

import com.fasterxml.jackson.annotation.JsonProperty;

public record TmdbResult(
        @JsonProperty("backdrop_path") String backdropPath,
        String title,
        String name
) {}
