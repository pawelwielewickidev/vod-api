package com.pawel.vod_api.service;

import com.pawel.vod_api.dto.EpisodeDto;
import com.pawel.vod_api.dto.WatchdogEpisodeDto;
import com.pawel.vod_api.exception.ResourceNotFoundException;
import com.pawel.vod_api.model.Episode;
import com.pawel.vod_api.model.Movie;
import com.pawel.vod_api.repository.EpisodeRepository;
import com.pawel.vod_api.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EpisodeService {

    private final EpisodeRepository episodeRepository;

    private final MovieRepository movieRepository;



    public Resource getEpisodeVideo(Long episodeId) {
        Episode episode = episodeRepository.findById(episodeId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono odcinka"));


        String videoPath = episode.getVideoFilePath();

        if (videoPath == null || videoPath.isEmpty()) {
            throw new RuntimeException("Odcinek nie ma przypisanego wideo");
        }

        Resource video = new FileSystemResource(videoPath);
        System.out.println("SZUKAM PLIKU TUTAJ: " + new java.io.File(videoPath).getAbsolutePath());

        if (!video.exists()) {
            throw new RuntimeException("Plik wideo nie istnieje na serwerze");
        }

        return video;
    }

    public void addEpisode(EpisodeDto request) {
        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new RuntimeException("Nie znaleziono filmu o ID: " + request.getMovieId()));


        Episode episode = new Episode();
        episode.setTitle(request.getTitle());
        episode.setEpisodeNumber(request.getEpisodeNumber());
        episode.setVideoFilePath(request.getVideoFilePath());
        episode.setEpDescription(request.getEpDescription());


        episode.setMovie(movie);


        episodeRepository.save(episode);
    }
    @Transactional(readOnly = true)
    public List<WatchdogEpisodeDto> findAllAsDto() {
        return episodeRepository.findAll().stream()
                .map(ep -> new WatchdogEpisodeDto(
                        ep.getId(),
                        ep.getShindenUrl(),
                        ep.getSourceEmbedUrl(),
                        ep.getVideoFilePath()
                ))
                .toList();
    }

    @Transactional
    public void syncDiscoveryData(List<WatchdogEpisodeDto> discoveryList) {
        // Implementacja logiki dopasowania nowo odkrytych odcinków
        // np. po movie_id oraz numerze odcinka
    }

    @Transactional
    public WatchdogEpisodeDto partialUpdate(Long id, WatchdogEpisodeDto dto) {
        Episode episode = episodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono odcinka o ID: " + id));

        // Aktualizujemy embedUrl, jeśli został dostarczony
        if (dto.sourceEmbedUrl() != null) {
            episode.setSourceEmbedUrl(dto.sourceEmbedUrl());
        }

        // Watchdog wysyła videoFilePath jako null w celu wyczyszczenia martwego linku,
        // lub Automator wysyła nowy string po pomyślnej ekstrakcji.
        episode.setVideoFilePath(dto.videoFilePath());

        Episode saved = episodeRepository.save(episode);

        return new WatchdogEpisodeDto(
                saved.getId(),
                saved.getShindenUrl(),
                saved.getSourceEmbedUrl(),
                saved.getVideoFilePath()
        );
    }
}
