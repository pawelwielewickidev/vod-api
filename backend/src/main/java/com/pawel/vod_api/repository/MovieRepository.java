package com.pawel.vod_api.repository;

import com.pawel.vod_api.model.Movie;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MovieRepository extends JpaRepository<Movie, Long> {
    Slice<Movie> findMovieByCategoryId(Long categoryId, Pageable pageable);
    List<Movie> findMovieByCategory_Id(Long categoryId);
    boolean existsByTmdbId(Long tmdbId);
    @Query("SELECT m FROM Movie m WHERE LOWER(REPLACE(m.title, ' ', '')) = LOWER(REPLACE(:title, ' ', ''))")
    List<Movie> findByNormalizedTitle(@Param("title") String title);
    boolean existsByTitle(String title);
    Optional<Movie> findByTmdbId(Long tmdbId);

}
