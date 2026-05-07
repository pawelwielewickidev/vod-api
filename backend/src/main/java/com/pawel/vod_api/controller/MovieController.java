package com.pawel.vod_api.controller;

import com.pawel.vod_api.dto.MovieDto;
import com.pawel.vod_api.dto.MovieResponseDto;
import com.pawel.vod_api.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MovieController {
    private final MovieService movieService;

    @GetMapping("/movies")
    public ResponseEntity<List<MovieResponseDto>> getAllMovies(){

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

    @PatchMapping(value = "/movies/{movieId}/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> uploadLogo
            (@PathVariable Long movieId, @RequestParam("file") MultipartFile file){
        movieService.uploadLogoPath(movieId, file);

        return ResponseEntity.noContent().build();
    }

    @GetMapping(value = "/movies/{movieId}/logo", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<Resource> getLogo
            (@PathVariable Long movieId){
        Resource logo = movieService.getLogoResource(movieId);
        return ResponseEntity.ok(logo);
    }

    @GetMapping(value = "/movies/category/{categoryId}")
    public ResponseEntity<List<MovieResponseDto>> getAllMoviesByCategory(@PathVariable Long categoryId){
        return ResponseEntity.ok(movieService.getMoviesByCategory(categoryId));
    }

    @GetMapping("/movies/search/category")
    public Slice<MovieResponseDto> getMoviesByCategoryId(
            @RequestParam Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return movieService.getMoviesByCategoryId(categoryId, pageable);
    }

    @DeleteMapping(value = "/movies/{movieId}")
    public ResponseEntity<Void> deleteMovie(@PathVariable Long movieId){
        movieService.deleteMovie(movieId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/movies/{movieId}/shnd")
    public ResponseEntity<Map<String, List<String>>> getShindenSeriesUrls(@PathVariable Long movieId) {
        List<String> shindenSeriesUrls = movieService.getShindenSeriesUrls(movieId);

        return ResponseEntity.ok(Map.of("shindenUrls", shindenSeriesUrls));
    }

}
