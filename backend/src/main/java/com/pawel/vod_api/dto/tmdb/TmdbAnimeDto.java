package com.pawel.vod_api.dto.tmdb;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TmdbAnimeDto(
        Integer id,

        @JsonProperty("name")
        String name,

        String overview,

        @JsonProperty("poster_path")
        String posterPath,

        @JsonProperty("backdrop_path")
        String backdropPath,

        @JsonProperty("first_air_date")
        String firstAirDate
) {}
