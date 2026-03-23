package com.pawel.vod_api.repository;

import com.pawel.vod_api.model.Movie;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovieRepository extends JpaRepository<Movie, Long> {
    List<Movie> findMovieByCategoryId(Long categoryId);
}
