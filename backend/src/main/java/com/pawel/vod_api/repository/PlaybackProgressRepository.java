package com.pawel.vod_api.repository;

import com.pawel.vod_api.model.PlaybackProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlaybackProgressRepository extends JpaRepository<PlaybackProgress, Long> {

    Optional<PlaybackProgress> findByProfileIdAndEpisodeId(Long profileId, Long episodeId);

    List<PlaybackProgress> findByProfileIdOrderByUpdatedAtDesc(Long profileId);

    void deleteByProfileIdAndEpisodeId(Long profileId, Long episodeId);

    Optional<PlaybackProgress> findFirstByProfileIdAndEpisodeMovieIdOrderByUpdatedAtDesc(Long profileId, Long movieId);
}