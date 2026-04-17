package com.pawel.vod_api.dto;

import lombok.Data;

@Data
public class EpisodeDto {
    private String title;
    private Integer episodeNumber;
    private String videoFilePath;
    private String epDescription;
    private Long movieId;
}
