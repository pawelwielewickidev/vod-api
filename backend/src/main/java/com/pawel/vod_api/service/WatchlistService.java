package com.pawel.vod_api.service;

import com.pawel.vod_api.dto.WatchlistResponseDto;
import com.pawel.vod_api.model.Movie;
import com.pawel.vod_api.model.Profile;
import com.pawel.vod_api.model.User;
import com.pawel.vod_api.model.Watchlist;
import com.pawel.vod_api.repository.MovieRepository;
import com.pawel.vod_api.repository.UserRepository;
import com.pawel.vod_api.repository.WatchlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WatchlistService {
    private final WatchlistRepository watchlistRepository;
    private final UserRepository userRepository;
    private final MovieRepository movieRepository;

    public WatchlistResponseDto addToWatchlist(Long userId, Long profileId, Long movieId){
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new RuntimeException("Nie znaleziono użytkownika o ID:" + userId));
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(()-> new RuntimeException("Nie znaleziono filmu o ID:" + movieId));
        Profile profile = user.getProfiles().stream()
                .filter(p -> p.getId().equals(profileId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Nie znaleziono profilu"));
        if (profile.getWatchlists().stream().anyMatch(watchlist -> watchlist.getMovie().equals(movie))){
            throw new RuntimeException("Film znajduje się juz na liście");
        }
        Watchlist newMovie = new Watchlist();
        newMovie.setMovie(movie);
        newMovie.setProfile(profile);

        Watchlist savedItem = watchlistRepository.save(newMovie);
        return new WatchlistResponseDto(savedItem.getId(), profile.getProfileName(), movie.getTitle());
    }
}
