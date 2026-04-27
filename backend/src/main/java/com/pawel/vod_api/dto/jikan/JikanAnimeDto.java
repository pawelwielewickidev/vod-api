package com.pawel.vod_api.dto.jikan;

import java.util.List;

public record JikanAnimeDto(Long mal_id,
                            String title,
                            String synopsis,
                            JikanImagesDto images,
                            Integer year,
                            JikanTrailerDto trailer,
                            List<JikanGenreDto> genres)
                            {
}
