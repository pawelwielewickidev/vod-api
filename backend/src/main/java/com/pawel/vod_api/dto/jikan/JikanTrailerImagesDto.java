package com.pawel.vod_api.dto.jikan;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record JikanTrailerImagesDto(@JsonProperty("maximum_image_url") String maximumImageUrl,
                                    @JsonProperty("large_image_url") String largeImageUrl) {
}
