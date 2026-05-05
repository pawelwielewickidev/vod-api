package com.pawel.vod_api.repository;

import com.pawel.vod_api.model.Episode;
import com.pawel.vod_api.model.Movie;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EpisodeRepository extends JpaRepository<Episode, Long> {
    boolean existsByMovieAndEpisodeNumber(Movie movie, Integer episodeNumber);
    List<Episode> findByMovieIdAndShindenUrlIsNotNullAndSourceEmbedUrlIsNullOrderByEpisodeNumberAsc(Long movieId);
    List<Episode> findByMovieIdAndShindenUrlIsNullOrderByEpisodeNumberAsc(Long movieId);
}
