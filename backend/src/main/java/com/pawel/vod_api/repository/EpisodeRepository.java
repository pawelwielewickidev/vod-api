package com.pawel.vod_api.repository;

import com.pawel.vod_api.model.Episode;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EpisodeRepository extends JpaRepository<Episode, Long> {
}
