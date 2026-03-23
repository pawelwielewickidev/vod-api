package com.pawel.vod_api.service;

import com.pawel.vod_api.dto.MovieDto;
import com.pawel.vod_api.dto.MovieResponseDto;
import com.pawel.vod_api.model.Category;
import com.pawel.vod_api.model.Movie;
import com.pawel.vod_api.repository.CategoryRepository;
import com.pawel.vod_api.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MovieService {
    private final MovieRepository movieRepository;
    private final CategoryRepository categoryRepository;

    public List<MovieResponseDto> getAllMovies(){

        List<Movie> moviesFromDb = movieRepository.findAll();

        return moviesFromDb.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    private MovieResponseDto mapToDto(Movie movie){
        return new MovieResponseDto(
                movie.getId(),
                movie.getTitle(),
                movie.getDescription(),
                movie.getReleaseDate(),
                movie.getThumbnailUrl(),
                movie.getCategory().getName()
        );
    }
    public MovieResponseDto saveMovie(MovieDto movieDto){
        Category findCategory = categoryRepository.findById(movieDto.getCategoryId()).orElseThrow(
                () -> new RuntimeException("Brak kategorii o ID:" + movieDto.getCategoryId())
        );

        Movie movie = new Movie();
        movie.setTitle(movieDto.getTitle());
        movie.setDescription(movieDto.getDescription());
        movie.setReleaseDate(movieDto.getReleaseDate());
        movie.setThumbnailUrl(movieDto.getThumbnailUrl());
        movie.setCategory(findCategory);

        Movie savedMovie = movieRepository.save(movie);

        return new MovieResponseDto(
                savedMovie.getId(),
                savedMovie.getTitle(),
                savedMovie.getDescription(),
                savedMovie.getReleaseDate(),
                savedMovie.getThumbnailUrl(),
                savedMovie.getCategory().getName()
        );
    }
    public MovieResponseDto getMovieById(Long id){
        Movie movie = movieRepository.findById(id).orElseThrow(
                ()-> new RuntimeException("Brak filmu o ID:" + id)
        );
        return new MovieResponseDto(
                movie.getId(),
                movie.getTitle(),
                movie.getDescription(),
                movie.getReleaseDate(),
                movie.getThumbnailUrl(),
                movie.getCategory().getName()
        );
    }
    public List<MovieResponseDto> getMoviesByCategory(Long categoryId){
        return movieRepository.findMovieByCategoryId(categoryId).stream()
                .map(movie -> new MovieResponseDto(
                        movie.getId(),
                        movie.getTitle(),
                        movie.getDescription(),
                        movie.getReleaseDate(),
                        movie.getThumbnailUrl(),
                        movie.getCategory().getName()
                ))
                .toList();
    }
}
