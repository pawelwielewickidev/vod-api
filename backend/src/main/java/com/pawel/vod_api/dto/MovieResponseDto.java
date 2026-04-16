package com.pawel.vod_api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovieResponseDto {
    private Long id;
    private String title;
    private String description;
    private Integer releaseDate;
    private String thumbnailUrl;
    private String backgroundUrl;
    private String categoryName;

    private List<EpisodeResponseDto> episodes;

}
