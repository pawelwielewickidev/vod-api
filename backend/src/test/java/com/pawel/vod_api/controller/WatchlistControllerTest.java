package com.pawel.vod_api.controller;

import com.pawel.vod_api.dto.*;
import com.pawel.vod_api.model.Movie;
import com.pawel.vod_api.service.WatchlistService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(WatchlistController.class)
public class WatchlistControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @MockitoBean
    private WatchlistService watchlistService;
    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldAddMovieToWatchlist() throws Exception{
        MovieResponseDto movie = new MovieResponseDto();
        movie.setId(1L);
        movie.setTitle("Test Movie");

        UserResponseDto user = new UserResponseDto();
        user.setId(1L);

        ProfileResponseDto profile = new ProfileResponseDto();
        profile.setId(1L);
        profile.setProfileName("Test Profile");

        WatchlistResponseDto watchlist = new WatchlistResponseDto();
        watchlist.setId(1L);
        watchlist.setMovieTitle(movie.getTitle());
        watchlist.setProfileName(profile.getProfileName());

        Mockito.when(watchlistService.addToWatchlist(1L, 1L, 1L)).thenReturn(watchlist);

        mockMvc.perform(post("/api/users/1/profiles/1/watchlists/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(watchlist)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.profileName").value("Test Profile"))
                .andExpect(jsonPath("$.movieTitle").value("Test Movie"));
    }
    @Test
    void shouldReturnWatchlist() throws Exception{
        UserResponseDto user = new UserResponseDto();
        user.setId(1L);
        ProfileResponseDto profile = new ProfileResponseDto();
        profile.setId(1L);
        profile.setProfileName("Test Profile");
        MovieResponseDto movie = new MovieResponseDto();
        movie.setTitle("Test Movie");

        WatchlistResponseDto watchlist = new WatchlistResponseDto();
        watchlist.setId(1L);
        watchlist.setMovieTitle(movie.getTitle());
        watchlist.setProfileName(profile.getProfileName());
        Mockito.when(watchlistService.getWatchlist(1L, 1L)).thenReturn(List.of(watchlist));

        mockMvc.perform(get("/api/users/1/profiles/1/watchlists"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].profileName").value("Test Profile"))
                .andExpect(jsonPath("$[0].movieTitle").value("Test Movie"));
    }
}
