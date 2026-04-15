package com.pawel.vod_api.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovieDto {
    private String title;
    private String description;
    private Integer releaseDate;
    private String thumbnailPath;
    private String backgroundPath;
    private Long categoryId;
}
