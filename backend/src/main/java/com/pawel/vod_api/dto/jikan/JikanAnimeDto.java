package com.pawel.vod_api.dto.jikan;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record JikanAnimeDto(Long mal_id,
                            String title,
                            String synopsis,
                            JikanImagesDto images,
                            Integer year,
                            JikanTrailerDto trailer,
                            List<JikanGenreDto> genres)
                            {
}
