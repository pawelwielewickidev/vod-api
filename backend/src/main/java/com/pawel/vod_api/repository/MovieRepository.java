package com.pawel.vod_api.repository;

import com.pawel.vod_api.model.Movie;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovieRepository extends JpaRepository<Movie, Long> {
    Slice<Movie> findMovieByCategoryId(Long categoryId, Pageable pageable);
    List<Movie> findMovieByCategory_Id(Long categoryId);
    boolean existsByTitle(String title);
}
