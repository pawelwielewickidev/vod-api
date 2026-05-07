package com.pawel.vod_api.dto.tmdb;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record TmdbSeasonResponse(@JsonProperty("episodes") List<TmdbEpisodeDto> episodes) {
}
