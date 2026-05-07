package com.pawel.vod_api.dto.tmdb;

import com.fasterxml.jackson.annotation.JsonProperty;

public record TmdbEpisodeDto (
        @JsonProperty("episode_number") Integer episodeNumber,
        @JsonProperty("name") String name,
        @JsonProperty("overview") String overview
) {}
