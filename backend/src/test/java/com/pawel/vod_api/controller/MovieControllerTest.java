package com.pawel.vod_api.controller;

import com.pawel.vod_api.dto.CategoryResponseDto;
import com.pawel.vod_api.dto.MovieDto;
import com.pawel.vod_api.dto.MovieResponseDto;
import com.pawel.vod_api.service.JwtService;
import com.pawel.vod_api.service.MovieService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import org.springframework.core.io.Resource;
import tools.jackson.databind.ObjectMapper;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MovieController.class)
public class MovieControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @MockitoBean
    private MovieService movieService;
    @Autowired
    private ObjectMapper objectMapper;
    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @MockitoBean
    private AuthenticationProvider authenticationProvider;

    @Test
    @WithMockUser(username = "admin@admin.com", roles = {"USER"})
    void shouldReturnPartialContent206WhenRangeHeaderIsPresent() throws Exception {
        Long movieId = 1L;
        byte[] fakeVideoData = "fake_video_data".getBytes();
        Resource mockResource = new ByteArrayResource(fakeVideoData);

        Mockito.when(movieService.getVideoResource(movieId)).thenReturn(mockResource);

        mockMvc.perform(get("/api/movies/{movieId}/stream", movieId)
                        .header(HttpHeaders.RANGE, "bytes=0-9"))
                .andExpect(status().isPartialContent())
                .andExpect(header().string(HttpHeaders.CONTENT_RANGE, "bytes 0-9/" + fakeVideoData.length))
                .andExpect(content().bytes("fake_video".getBytes()));
    }

    @Test
    @WithMockUser(username = "admin@admin.com", roles = {"USER"})
    void shouldReturnListOfMoviesAndStatus200() throws Exception{

        MovieResponseDto testMovie = new MovieResponseDto(
                1L, 123L, "Test", "Description", 2019, "url","bgurl", "logoPath", "Category",
                Collections.emptyList());

        Mockito.when(movieService.getAllMovies()).thenReturn(List.of(testMovie));

        mockMvc.perform(get("/api/movies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Test"))
                .andExpect(jsonPath("$[0].categoryName").value("Category"));
    }

    @Test
    @WithMockUser(username = "admin@admin.com", roles = {"USER"})
    void shouldCreateNewMovieAndStatus201() throws Exception{

        CategoryResponseDto newCategory = new CategoryResponseDto(1L, "Action", "Opis");
        MovieDto incomingDto = new MovieDto("Taxi Driver", "Best Movie", 1976, "url", "bgurl", "logoPath", newCategory.getId(), 456L);
        MovieResponseDto mockedResponse = new MovieResponseDto(1L, 456L, "Taxi Driver", "Best Movie", 1976, "url", "bgurl", "logoPath", newCategory.getName(), Collections.emptyList());

        Mockito.when(movieService.saveMovie(Mockito.any(MovieDto.class))).thenReturn(mockedResponse);

        mockMvc.perform(post("/api/movies")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(incomingDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Taxi Driver"))
                .andExpect(jsonPath("$.categoryName").value("Action"));

    }
    @Test
    @WithMockUser(username = "admin@admin.com", roles = {"USER"})
    void shouldReturnMovieByIdAnd200() throws Exception{
        MovieResponseDto movie = new MovieResponseDto(
                1L, 789L, "test", "opis", 2000, "url", "bgurl", "logoPath", "test", Collections.emptyList());


        Mockito.when(movieService.getMovieById(1L)).thenReturn(movie);

        mockMvc.perform(get("/api/movies/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("test"))
                .andExpect(jsonPath("$.categoryName").value("test"));
    }
    @Test
    @WithMockUser(username = "admin@admin.com", roles = {"USER"})
    void shouldReturnMoviesByCategories() throws Exception{
        MovieResponseDto fantasyMovie = new MovieResponseDto(
                1L, 101L, "test", "opis", 2000, "url", "bgurl", "logoPath", "fantasy", Collections.emptyList()
        );

        Mockito.when(movieService.getMoviesByCategory(anyLong())).thenReturn(List.of(fantasyMovie));

        mockMvc.perform(get("/api/movies/category/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("test"))
                .andExpect(jsonPath("$[0].categoryName").value("fantasy"));
    }

    @Test
    @WithMockUser(username = "admin@admin.com", roles = {"USER"})
    void shouldUploadVideoFileAndReturn204NoContent() throws Exception{
        Long movieId = 1L;
        MockMultipartFile mockFile = new MockMultipartFile(
                "file", "testmovie", "video/mp4", "content".getBytes());

        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/movies/{movieId}/video", movieId)
                .file(mockFile)
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                .with(request ->  {
                    request.setMethod(HttpMethod.PATCH.name());
                    return request;
                }))
                .andExpect(status().isNoContent());
        Mockito.verify(movieService, Mockito.times(1)).uploadVideoPath(movieId, mockFile);
    }

    @Test
    @WithMockUser(username = "admin@admin.com", roles = {"USER"})
    void shouldUploadPosterFileAndReturn204NoContent() throws Exception{
        Long movieId = 1L;
        MockMultipartFile mockFile = new MockMultipartFile(
                "file", "okladka", MediaType.IMAGE_JPEG_VALUE, "content".getBytes());

        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/movies/{movieId}/poster", movieId)
                .file(mockFile)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .with(request ->  {
                    request.setMethod(HttpMethod.PATCH.name());
                    return request;
        }))
                .andExpect(status().isNoContent());
        Mockito.verify(movieService, Mockito.times(1)).uploadThumbnailPath(movieId, mockFile);

    }
}
