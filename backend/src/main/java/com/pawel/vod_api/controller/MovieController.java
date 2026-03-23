package com.pawel.vod_api.controller;

import com.pawel.vod_api.dto.MovieDto;
import com.pawel.vod_api.dto.MovieResponseDto;
import com.pawel.vod_api.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MovieController {
    private final MovieService movieService;

    @GetMapping("/movies")
    public ResponseEntity<List<MovieResponseDto>> getAllMovies(@RequestParam(required = false)Long categoryId){
        //all from categories
        if (categoryId != null){
            return ResponseEntity.ok(movieService.getMoviesByCategory(categoryId));
        }
        //all movies
        return ResponseEntity.ok(movieService.getAllMovies());
    }

    @GetMapping("/movies/{id}")
    public MovieResponseDto getMovieById(@PathVariable Long id){
       return movieService.getMovieById(id);
    }

    @PostMapping("/movies")
    public ResponseEntity<MovieResponseDto> createMovie(@RequestBody MovieDto movieDto){
        MovieResponseDto response = movieService.saveMovie(movieDto);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
