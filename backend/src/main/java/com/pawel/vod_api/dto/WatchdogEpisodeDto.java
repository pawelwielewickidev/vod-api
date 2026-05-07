package com.pawel.vod_api.dto;

public record WatchdogEpisodeDto(Long id,
                                 String shindenUrl,
                                 String sourceEmbedUrl,
                                 String videoFilePath)    {
}
