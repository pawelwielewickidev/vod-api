package com.pawel.vod_api.controller;

import com.pawel.vod_api.dto.*;
import com.pawel.vod_api.model.Movie;
import com.pawel.vod_api.model.Profile;
import com.pawel.vod_api.model.User;
import com.pawel.vod_api.model.Watchlist;
import com.pawel.vod_api.repository.UserRepository;
import com.pawel.vod_api.service.JwtService;
import com.pawel.vod_api.service.WatchlistService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.mock.http.server.reactive.MockServerHttpRequest.delete;
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
    @MockitoBean
    private UserRepository userRepository;
    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @MockitoBean
    private AuthenticationProvider authenticationProvider;

    @Test
    @WithMockUser(username = "admin@admin.com", roles = {"USER"})
    void shouldAddMovieToWatchlist() throws Exception{
        MovieResponseDto movie = new MovieResponseDto();
        movie.setId(1L);
        movie.setTitle("Test Movie");
        movie.setThumbnailPath("/test-thumbnail.jpg");

        UserResponseDto user = new UserResponseDto();
        user.setId(1L);

        ProfileResponseDto profile = new ProfileResponseDto();
        profile.setId(1L);
        profile.setProfileName("Test Profile");

        WatchlistResponseDto watchlist = new WatchlistResponseDto();
        watchlist.setId(1L);
        watchlist.setMovieTitle(movie.getTitle());
        watchlist.setProfileName(profile.getProfileName());
        watchlist.setMovie(movie);

        Mockito.when(watchlistService.addToWatchlist(1L, 1L, 1L)).thenReturn(watchlist);

        mockMvc.perform(post("/api/users/1/profiles/1/watchlists/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(watchlist)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.profileName").value("Test Profile"))
                .andExpect(jsonPath("$.movieTitle").value("Test Movie"))
                .andExpect(jsonPath("$.movie.id").value(1))
                .andExpect(jsonPath("$.movie.title").value("Test Movie"))
                .andExpect(jsonPath("$.movie.thumbnailPath").value("/test-thumbnail.jpg"));
    }
    @Test
    @WithMockUser(username = "admin@admin.com", roles = {"USER"})
    void shouldReturnWatchlist() throws Exception{
        UserResponseDto user = new UserResponseDto();
        user.setId(1L);
        ProfileResponseDto profile = new ProfileResponseDto();
        profile.setId(1L);
        profile.setProfileName("Test Profile");
        MovieResponseDto movie = new MovieResponseDto();
        movie.setId(1L);
        movie.setTitle("Test Movie");
        movie.setThumbnailPath("/test-thumbnail.jpg");

        WatchlistResponseDto watchlist = new WatchlistResponseDto();
        watchlist.setId(1L);
        watchlist.setMovieTitle(movie.getTitle());
        watchlist.setProfileName(profile.getProfileName());
        watchlist.setMovie(movie);
        Mockito.when(watchlistService.getWatchlist(1L, 1L)).thenReturn(List.of(watchlist));

        mockMvc.perform(get("/api/users/1/profiles/1/watchlists"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].profileName").value("Test Profile"))
                .andExpect(jsonPath("$[0].movieTitle").value("Test Movie"))
                .andExpect(jsonPath("$[0].movie.id").value(1))
                .andExpect(jsonPath("$[0].movie.title").value("Test Movie"))
                .andExpect(jsonPath("$[0].movie.thumbnailPath").value("/test-thumbnail.jpg"));
    }
    @Test
    @WithMockUser(username = "admin@admin.com", roles = {"USER"})
    void shouldReturn204AndDeleteFromWatchlist() throws Exception{
        Long userId = 1L;
        Long profileId = 1L;
        Long movieId = 1L;

        mockMvc.perform(MockMvcRequestBuilders.delete("/api/users/1/profiles/1/watchlists/1"))
                .andExpect(status().isNoContent());
        Mockito.verify(watchlistService, Mockito.times(1))
                .removeMovieFromWatchlist(userId, profileId, movieId);
    }
}
