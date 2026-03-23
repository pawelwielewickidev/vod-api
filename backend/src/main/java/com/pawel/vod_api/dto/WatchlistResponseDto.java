package com.pawel.vod_api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WatchlistResponseDto {
    private Long id;
    private String profileName;
    private String movieTitle;
}
