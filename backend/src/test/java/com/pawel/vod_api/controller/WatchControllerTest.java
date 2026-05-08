package com.pawel.vod_api.controller;

import com.pawel.vod_api.model.Episode;
import com.pawel.vod_api.repository.EpisodeRepository;
import com.pawel.vod_api.repository.MovieRepository;
import com.pawel.vod_api.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;


import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(WatchController.class)
class WatchControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EpisodeRepository episodeRepository;

    @MockitoBean
    private MovieRepository movieRepository; // Mimo że nieużywane w tej metodzie, jest to zależność kontrolera

    // Mockowanie zależności związanych z bezpieczeństwem, wymagane przez WebMvcTest
    @MockitoBean
    private JwtService jwtService;
    @MockitoBean
    private UserDetailsService userDetailsService;
    @MockitoBean
    private AuthenticationProvider authenticationProvider;

    private Episode testEpisode;

    @BeforeEach
    void setUp() {
        testEpisode = new Episode();
        testEpisode.setId(1L);
        testEpisode.setTitle("Test Episode");
    }

    @Test
    @WithMockUser
    void streamVideo_shouldReturnNotFound_whenEpisodeDoesNotExist() throws Exception {
        // given
        when(episodeRepository.findById(1L)).thenReturn(Optional.empty());

        // when & then
        mockMvc.perform(get("/api/v1/watch/1"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void streamVideo_shouldReturnNotFound_whenVideoFilePathIsNull() throws Exception {
        // given
        testEpisode.setVideoFilePath(null);
        when(episodeRepository.findById(1L)).thenReturn(Optional.of(testEpisode));

        // when & then
        mockMvc.perform(get("/api/v1/watch/1"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void streamVideo_shouldReturnNotFound_whenVideoFilePathIsEmpty() throws Exception {
        // given
        testEpisode.setVideoFilePath("");
        when(episodeRepository.findById(1L)).thenReturn(Optional.of(testEpisode));

        // when & then
        mockMvc.perform(get("/api/v1/watch/1"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void streamVideo_shouldReturnRangeNotSatisfiable_whenConnectionFails() throws Exception {
        // given
        // Używamy nieprawidłowego URL, aby wywołać wyjątek w bloku try-catch kontrolera
        testEpisode.setVideoFilePath("htp:/invalid-url");
        when(episodeRepository.findById(1L)).thenReturn(Optional.of(testEpisode));

        // when & then
        mockMvc.perform(get("/api/v1/watch/1")
                        .header(HttpHeaders.RANGE, "bytes=0-1023"))
                .andExpect(status().is(416)); // Requested Range Not Satisfiable
    }
}
