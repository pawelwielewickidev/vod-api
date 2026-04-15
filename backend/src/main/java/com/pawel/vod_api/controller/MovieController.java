package com.pawel.vod_api.controller;

import com.pawel.vod_api.dto.MovieDto;
import com.pawel.vod_api.dto.MovieResponseDto;
import com.pawel.vod_api.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

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

    @GetMapping(value = "/movies/{movieId}/stream", produces = "video/mp4")
    public ResponseEntity<Resource> streamMovie(@PathVariable Long movieId){
        Resource video = movieService.getVideoResource(movieId);

        return ResponseEntity.ok(video);
    }

    @GetMapping(value = "/movies/{movieId}/poster", produces = MediaType.IMAGE_JPEG_VALUE)
    public ResponseEntity<Resource> getPoster(@PathVariable Long movieId){
        Resource poster = movieService.getPosterResource(movieId);
        return ResponseEntity.ok(poster);
    }

    @PatchMapping(value = "/movies/{movieId}/video", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> uploadVideo(@PathVariable Long movieId, @RequestParam("file") MultipartFile file){
        movieService.uploadVideoPath(movieId, file);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping(value = "/movies/{movieId}/poster", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> uploadThumbnail(
            @PathVariable Long movieId, @RequestParam("file") MultipartFile file){
        movieService.uploadThumbnailPath(movieId, file);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping(value = "/movies/{movieId}/bg", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> uploadBackground
            (@PathVariable Long movieId, @RequestParam("file") MultipartFile file){
        movieService.uploadBackgroundPath(movieId, file);

        return ResponseEntity.noContent().build();
    }

    @GetMapping(value = "/movies/{movieId}/bg", produces = MediaType.IMAGE_JPEG_VALUE)
    public ResponseEntity<Resource> getBackground
            (@PathVariable Long movieId){
        Resource background = movieService.getBackgroundResource(movieId);
        return ResponseEntity.ok(background);
    }
}
