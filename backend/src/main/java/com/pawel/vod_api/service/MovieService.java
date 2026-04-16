package com.pawel.vod_api.service;

import com.pawel.vod_api.dto.EpisodeResponseDto;
import com.pawel.vod_api.dto.MovieDto;
import com.pawel.vod_api.dto.MovieResponseDto;
import com.pawel.vod_api.exception.ResourceNotFoundException;
import com.pawel.vod_api.model.Category;
import com.pawel.vod_api.model.Episode;
import com.pawel.vod_api.model.Movie;
import com.pawel.vod_api.repository.CategoryRepository;
import com.pawel.vod_api.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.toList;

@Service
@RequiredArgsConstructor
public class MovieService {
    private final MovieRepository movieRepository;
    private final CategoryRepository categoryRepository;
    private final String UPLOAD_DIR = "media/";

    public void uploadThumbnailPath(Long movieId, MultipartFile file) {
        Movie movie = movieRepository.findById(movieId).orElseThrow(
                () -> new ResourceNotFoundException("Nie znaleziono filmu o ID: " + movieId));

        if(file.isEmpty()) {
            throw new IllegalArgumentException("Plik okładki nie może być pusty.");
        }
        try {
            Path postersDir = Path.of("media", "posters");
            if (!Files.exists(postersDir)) {
                Files.createDirectories(postersDir);
            }
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = postersDir.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            movie.setThumbnailPath(filePath.toString());
            movieRepository.save(movie);
        } catch (IOException e) {
            throw new RuntimeException("Błąd podczas zapisywania okładki na serwerze", e);
        }
    }

    public Resource getPosterResource(Long movieId) {
        Movie movie = movieRepository.findById(movieId).orElseThrow(
                ()-> new ResourceNotFoundException("Nie znaleziono filmu o ID: " + movieId)
        );
        String posterPath = movie.getThumbnailPath();
        if(posterPath == null) {
            throw new ResourceNotFoundException("Ten film nie ma przypisanego pliku okładki.");
        }
        Resource posterResource = new FileSystemResource(posterPath);
        if(!posterResource.exists()) {
            throw new ResourceNotFoundException("Plik nie istnieje.");
        }
        return posterResource;
    }

    public void uploadVideoPath(Long movieId, MultipartFile file) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new ResourceNotFoundException("Nie znaleziono filmu o ID: " + movieId));

        if (file.isEmpty()) {
            throw new IllegalArgumentException("Plik wideo nie może być pusty.");
        }

        try {
            Path directoryPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(directoryPath)) {
                Files.createDirectories(directoryPath);
            }
            String uniqueFileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(directoryPath.toString(), uniqueFileName);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            movie.setVideoFilePath(filePath.toString());
            movieRepository.save(movie);
        } catch (IOException e) {
            throw new RuntimeException("Nie udało się zapisać pliku wideo: " + e.getMessage());
        }
    }

    public Resource getVideoResource(Long movieId) {
        Movie movie = movieRepository.findById(movieId).
                orElseThrow(() -> new ResourceNotFoundException("Nie znaleziono filmu o ID: " + movieId));

        String videoPath = movie.getVideoFilePath();
        if(videoPath == null){
            throw new ResourceNotFoundException("Ten film nie ma przypisanego pliku wideo");
        }
        Resource videoResource = new FileSystemResource(videoPath);
        if (!videoResource.exists()) {
            throw new ResourceNotFoundException("Plik nie istnieje");
        }
        return videoResource;
    }

    public List<MovieResponseDto> getAllMovies(){

        List<Movie> moviesFromDb = movieRepository.findAll();

        return moviesFromDb.stream()
                .map(this::mapToDto)
                .collect(toList());
    }
    private MovieResponseDto mapToDto(Movie movie){


        return new MovieResponseDto(
                movie.getId(),
                movie.getTitle(),
                movie.getDescription(),
                movie.getReleaseDate(),
                movie.getThumbnailPath(),
                movie.getBackgroundPath(),
                movie.getCategory().getName(),
                movie.getEpisodes() != null
                        ? movie.getEpisodes().stream()
                          .map(this::mapToEpisodeDto)

                          .toList()
                        : new ArrayList<>()


        );


    }
    public MovieResponseDto saveMovie(MovieDto movieDto){
        Category findCategory = categoryRepository.findById(movieDto.getCategoryId()).orElseThrow(
                () -> new ResourceNotFoundException("Brak kategorii o ID:" + movieDto.getCategoryId())
        );

        Movie movie = new Movie();
        movie.setTitle(movieDto.getTitle());
        movie.setDescription(movieDto.getDescription());
        movie.setReleaseDate(movieDto.getReleaseDate());
        movie.setThumbnailPath(movieDto.getThumbnailPath());
        movie.setBackgroundPath(movieDto.getBackgroundPath());
        movie.setCategory(findCategory);

        Movie savedMovie = movieRepository.save(movie);

        return new MovieResponseDto(
                savedMovie.getId(),
                savedMovie.getTitle(),
                savedMovie.getDescription(),
                savedMovie.getReleaseDate(),
                savedMovie.getThumbnailPath(),
                savedMovie.getBackgroundPath(),
                savedMovie.getCategory().getName(),
                movie.getEpisodes() != null
                        ? movie.getEpisodes().stream()
                          .map(this::mapToEpisodeDto)
                          .toList()
                        : new ArrayList<>()

        );
    }
    public MovieResponseDto getMovieById(Long id){
        Movie movie = movieRepository.findById(id).orElseThrow(
                ()-> new ResourceNotFoundException("Brak filmu o ID:" + id)
        );
        return new MovieResponseDto(
                movie.getId(),
                movie.getTitle(),
                movie.getDescription(),
                movie.getReleaseDate(),
                movie.getThumbnailPath(),
                movie.getBackgroundPath(),
                movie.getCategory().getName(),
                movie.getEpisodes() != null
                        ? movie.getEpisodes().stream()
                          .map(this::mapToEpisodeDto)
                          .toList()
                        : new ArrayList<>()
        );

    }

    public void deleteMovie(Long id){
        Movie movie = movieRepository.findById(id).orElseThrow(
                ()-> new ResourceNotFoundException("Brak filmu o ID:" + id)
        );
        movieRepository.delete(movie);
    }

    public List<MovieResponseDto> getMoviesByCategory(Long categoryId){
        return movieRepository.findMovieByCategoryId(categoryId).stream()
                .map(movie -> new MovieResponseDto(
                        movie.getId(),
                        movie.getTitle(),
                        movie.getDescription(),
                        movie.getReleaseDate(),
                        movie.getThumbnailPath(),
                        movie.getBackgroundPath(),
                        movie.getCategory().getName(),
                        movie.getEpisodes() != null
                                ? movie.getEpisodes().stream()
                                  .map(this::mapToEpisodeDto)
                                  .toList()
                                : new ArrayList<>()
                ))
                .toList();
    }

    public void uploadBackgroundPath(Long movieId, MultipartFile file) {
        Movie movie = movieRepository.findById(movieId).orElseThrow(
                () -> new ResourceNotFoundException("Nie znaleziono filmu o ID: " + movieId));

        if(file.isEmpty()) {
            throw new IllegalArgumentException("Plik tła nie może być pusty.");
        }
        try {
            Path bgDir = Path.of("media", "background");
            if (!Files.exists(bgDir)) {
                Files.createDirectories(bgDir);
            }
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = bgDir.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            movie.setBackgroundPath(filePath.toString());
            movieRepository.save(movie);
        } catch (IOException e) {
            throw new RuntimeException("Błąd podczas zapisywania tła na serwerze", e);
        }
    }

    public Resource getBackgroundResource(Long movieId) {
        Movie movie = movieRepository.findById(movieId).orElseThrow(
                ()-> new ResourceNotFoundException("Nie znaleziono filmu o ID: " + movieId)
        );
        String bgPath = movie.getBackgroundPath();
        if(bgPath == null) {
            throw new ResourceNotFoundException("Ten film nie ma przypisanego pliku tła.");
        }
        Resource bgResource = new FileSystemResource(bgPath);
        if(!bgResource.exists()) {
            throw new ResourceNotFoundException("Plik nie istnieje.");
        }
        return bgResource;
    }

    private EpisodeResponseDto mapToEpisodeDto(Episode episode) {
        return EpisodeResponseDto.builder()
                .id(episode.getId())
                .title(episode.getTitle())
                .episodeNumber(episode.getEpisodeNumber())
                .streamUrl("/api/episodes/" + episode.getId() + "/stream")
                .build();
    }
}
