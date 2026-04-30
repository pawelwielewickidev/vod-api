package com.pawel.vod_api.dto.jikan;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record JikanJpgDto(String large_image_url) {
}
