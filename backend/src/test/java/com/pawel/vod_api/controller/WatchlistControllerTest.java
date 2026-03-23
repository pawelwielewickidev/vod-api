package com.pawel.vod_api.controller;

import com.pawel.vod_api.service.WatchlistService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(WatchlistController.class)
public class WatchlistControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @MockitoBean
    private WatchlistService watchlistService;

    @Test
    void shouldAddMovieToWatchlist() throws Exception{

    }
}
