package com.pawel.vod_api.dto.tmdb;

import java.util.List;

public record TmdbSearchResponse(List<TmdbResult> results) {}