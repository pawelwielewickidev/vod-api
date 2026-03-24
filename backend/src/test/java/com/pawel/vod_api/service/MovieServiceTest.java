package com.pawel.vod_api.service;

import com.pawel.vod_api.dto.MovieResponseDto;
import com.pawel.vod_api.model.Movie;
import com.pawel.vod_api.repository.MovieRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;

import static java.util.Optional.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class MovieServiceTest {
    @InjectMocks
    private MovieService movieService;
    @Mock
    private MovieRepository movieRepository;
    @TempDir
    Path tempDir;
    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(movieService, "UPLOAD_DIR", tempDir.toString() + "/");
    }

    @Test
    void shouldUploadMovieAndSavePath() throws Exception {
        Long movieId = 2L;
        Movie movie = new Movie();
        movie.setId(movieId);

        MockMultipartFile file = new MockMultipartFile(
                "file", "test_video.mp4", "video/mp4", "Zawartośc pliku".getBytes());

        Mockito.when(movieRepository.findById(movieId)).thenReturn(Optional.of(movie));

        movieService.uploadVideoPath(movieId, file);

        Mockito.verify(movieRepository, Mockito.times(1)).save(movie);

        assertNotNull(movie.getVideoFilePath());
        assertTrue(movie.getVideoFilePath().contains("test_video.mp4"));
        Path savedFilePath = Path.of(movie.getVideoFilePath());
        assertTrue(Files.exists(savedFilePath));
        assertEquals("Zawartośc pliku", Files.readString(savedFilePath));
    }

    @Test
    void shouldThrowExceptionWhenFileIsEmpty() throws Exception {
        Long movieId = 1L;
        Movie movie = new Movie();
        movie.setId(movieId);

        MockMultipartFile emptyFile = new MockMultipartFile("file", new byte[0]);

        Mockito.when(movieRepository.findById(movieId)).thenReturn(Optional.of(movie));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                movieService.uploadVideoPath(movieId, emptyFile)
        );

        assertEquals(exception.getMessage(), "Plik wideo nie może być pusty.");

        Mockito.verify(movieRepository, Mockito.never()).save(Mockito.any());

    }

}
