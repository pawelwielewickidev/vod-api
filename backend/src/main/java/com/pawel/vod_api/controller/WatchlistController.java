package com.pawel.vod_api.controller;

import com.pawel.vod_api.dto.WatchlistResponseDto;
import com.pawel.vod_api.model.Watchlist;
import com.pawel.vod_api.service.WatchlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/profiles/{profileId}")
@RequiredArgsConstructor
public class WatchlistController {
    private final WatchlistService watchlistService;

    @PostMapping("/watchlists/{movieId}")
    public ResponseEntity<WatchlistResponseDto> addMovieToWatchlist(
            @PathVariable Long userId, @PathVariable Long profileId, @PathVariable Long movieId) {

        WatchlistResponseDto watchlistResponseDto = watchlistService.addToWatchlist(userId, profileId, movieId);

        return ResponseEntity.status(HttpStatus.CREATED).body(watchlistResponseDto);
    }

    @GetMapping("/watchlists")
    public List<WatchlistResponseDto> getWatchlists(@PathVariable Long userId, @PathVariable Long profileId) {
        return watchlistService.getWatchlist(userId, profileId);
    }
}
