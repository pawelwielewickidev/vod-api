package com.pawel.vod_api.service;

import com.pawel.vod_api.model.Movie;
import com.pawel.vod_api.model.Profile;
import com.pawel.vod_api.model.User;
import com.pawel.vod_api.model.Watchlist;
import com.pawel.vod_api.repository.MovieRepository;
import com.pawel.vod_api.repository.UserRepository;
import com.pawel.vod_api.repository.WatchlistRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
public class WatchlistServiceTest {
    @Mock
    private UserRepository userRepository;
    @Mock
    private MovieRepository movieRepository;
    @Mock
    private WatchlistRepository watchlistRepository;
    @InjectMocks
    private WatchlistService watchlistService;

    @Test
    void shouldThrowExceptionWhenMovieAlreadyOnWatchlist() throws Exception{
        Movie testMovie = new Movie();
        testMovie.setId(1L);

        Profile profile = new Profile();
        profile.setId(11L);

        User user = new User();
        user.setId(111L);
        user.setProfiles(List.of(profile));

        Watchlist existingWatchlist = new Watchlist();
        existingWatchlist.setMovie(testMovie);
        existingWatchlist.setProfile(profile);

        profile.setWatchlists(List.of(existingWatchlist));

        Mockito.when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        Mockito.when(movieRepository.findById(1L)).thenReturn(Optional.of(testMovie));

        assertThrows(RuntimeException.class, ()-> watchlistService.addToWatchlist(111L, 10L, 1L));

    }
    @Test
    void shouldDeleteMovieFromWatchlist() throws Exception{
        Movie movie = new Movie();
        movie.setId(1L);

        Watchlist watchlist = new Watchlist();
        watchlist.setMovie(movie);

        Profile  profile = new Profile();
        profile.setId(10L);
        profile.setWatchlists(new ArrayList<>(List.of(watchlist)));

        User user = new User();
        user.setId(1L);
        user.setProfiles(List.of(profile));

        Mockito.when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        watchlistService.removeMovieFromWatchlist(user.getId(), profile.getId(), movie.getId());

        assertTrue(profile.getWatchlists().isEmpty());

        Mockito.verify(userRepository, Mockito.times(1)).save(user);


    }
}
