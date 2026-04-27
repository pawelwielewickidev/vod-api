package com.pawel.vod_api.dto.jikan;

import com.fasterxml.jackson.annotation.JsonProperty;

public record JikanTrailerDto(JikanTrailerImagesDto images, String url,
                              @JsonProperty String youtubeId,
                              @JsonProperty("embed_url") String embedUrl) {
}
