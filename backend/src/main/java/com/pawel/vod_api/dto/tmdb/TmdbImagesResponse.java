package com.pawel.vod_api.dto.tmdb;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TmdbImagesResponse(
        List<TmdbLogoDto> logos
) {}