package com.pawel.vod_api.controller;

import com.pawel.vod_api.dto.CategoryResponseDto;
import com.pawel.vod_api.dto.MovieDto;
import com.pawel.vod_api.dto.MovieResponseDto;
import com.pawel.vod_api.service.MovieService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MovieController.class)
public class MovieControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @MockitoBean
    private MovieService movieService;
    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldReturnListOfMoviesAndStatus200() throws Exception{

        MovieResponseDto testMovie = new MovieResponseDto(
                1L, "Test", "Description", 2019, "url", "Category"
        );

        Mockito.when(movieService.getAllMovies()).thenReturn(List.of(testMovie));

        mockMvc.perform(get("/api/movies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test"))
                .andExpect(jsonPath("$.categoryName").value("Category"));
    }

    @Test
    void shouldCreateNewMovieAndStatus201() throws Exception{

        CategoryResponseDto newCategory = new CategoryResponseDto(1L, "Action", "Opis");
        MovieDto incomingDto = new MovieDto("Taxi Driver", "Best Movie", 1976, "url", newCategory.getId());
        MovieResponseDto mockedResponse = new MovieResponseDto(1L, "Taxi Driver", "Best Movie", 1976, "url", newCategory.getName());

        Mockito.when(movieService.saveMovie(Mockito.any(MovieDto.class))).thenReturn(mockedResponse);

        mockMvc.perform(post("/api/movies")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(incomingDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Taxi Driver"))
                .andExpect(jsonPath("$.categoryName").value("Action"));

    }
    @Test
    void shouldReturnMovieByIdAnd200() throws Exception{
        MovieResponseDto movie = new MovieResponseDto(
                1L, "test", "opis", 2000, "url", "test");


        Mockito.when(movieService.getMovieById(1L)).thenReturn(movie);

        mockMvc.perform(get("/api/movies/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("test"))
                .andExpect(jsonPath("$.categoryName").value("test"));
    }
    @Test
    void shouldReturnMoviesByCategories() throws Exception{
        MovieResponseDto fantasyMovie = new MovieResponseDto(
                1L, "test", "opis", 2000, "url", "fantasy"
        );

        Mockito.when(movieService.getMoviesByCategory(1L)).thenReturn(List.of(fantasyMovie));

        mockMvc.perform(get("/api/movies")
                .param("categoryId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("test"))
                .andExpect(jsonPath("$[0].categoryName").value("fantasy"));
    }
}
