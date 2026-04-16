package com.pawel.vod_api.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EpisodeResponseDto {
    private Long id;
    private String title;
    private Integer episodeNumber;


    private String streamUrl;
}
