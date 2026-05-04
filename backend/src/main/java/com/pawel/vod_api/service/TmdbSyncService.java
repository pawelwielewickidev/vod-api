package com.pawel.vod_api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pawel.vod_api.model.Movie;
import com.pawel.vod_api.repository.EpisodeRepository;
import com.pawel.vod_api.model.Episode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class TmdbSyncService {

    @Value("${tmdb.api.key}")
    private String apiKey;

    @Value("${tmdb.api.base-url}")
    private String apiUrl;

    private final EpisodeRepository episodeRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void syncEpisodesFromTmdb(Long tmdbId, int seasonNumber, Movie movie) {
        String url = String.format("%s/tv/%d/season/%d?api_key=%s&language=pl-PL",
                apiUrl, tmdbId, seasonNumber, apiKey);

        try {

            String rawJson = restTemplate.getForObject(url, String.class);

            if (rawJson != null) {

                JsonNode response = objectMapper.readTree(rawJson);

                if (response.has("episodes")) {
                    JsonNode episodesArray = response.get("episodes");

                    for (JsonNode episodeNode : episodesArray) {
                        int episodeNum = episodeNode.get("episode_number").asInt();
                        String title = episodeNode.get("name").asText();
                        String overview = episodeNode.get("overview").asText();
                        if (overview != null && overview.length() > 1000) {
                            overview = overview.substring(0, 997) + "...";
                        }

                        if (!episodeRepository.existsByMovieAndEpisodeNumber(movie, episodeNum)) {

                            Episode newEpisode = new Episode();
                            newEpisode.setMovie(movie);
                            newEpisode.setEpisodeNumber(episodeNum);
                            newEpisode.setTitle(title);
                            newEpisode.setEpDescription(overview);

                            newEpisode.setSourceEmbedUrl(null);
                            newEpisode.setVideoFilePath(null);

                            episodeRepository.save(newEpisode);
                            System.out.println("✅ Zapisano odcinek: " + title);
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Błąd synchronizacji TMDB: " + e.getMessage());
            e.printStackTrace();
        }
    }
}