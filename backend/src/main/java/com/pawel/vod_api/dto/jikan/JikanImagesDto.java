package com.pawel.vod_api.dto.jikan;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record JikanImagesDto(JikanJpgDto jpg) {
}
