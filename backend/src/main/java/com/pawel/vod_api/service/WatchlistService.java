package com.pawel.vod_api.service;

import com.pawel.vod_api.dto.MovieResponseDto;
import com.pawel.vod_api.dto.WatchlistResponseDto;
import com.pawel.vod_api.exception.DuplicateResourceException;
import com.pawel.vod_api.exception.ResourceNotFoundException;
import com.pawel.vod_api.model.Movie;
import com.pawel.vod_api.model.Profile;
import com.pawel.vod_api.model.User;
import com.pawel.vod_api.model.Watchlist;
import com.pawel.vod_api.repository.MovieRepository;
import com.pawel.vod_api.repository.UserRepository;
import com.pawel.vod_api.repository.WatchlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WatchlistService {
    private final WatchlistRepository watchlistRepository;
    private final UserRepository userRepository;
    private final MovieRepository movieRepository;

    public WatchlistResponseDto addToWatchlist(Long userId, Long profileId, Long movieId){
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new ResourceNotFoundException("Nie znaleziono użytkownika o ID:" + userId));
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(()-> new ResourceNotFoundException("Nie znaleziono filmu o ID:" + movieId));
        Profile profile = user.getProfiles().stream()
                .filter(p -> p.getId().equals(profileId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Nie znaleziono profilu"));
        if (profile.getWatchlists().stream().anyMatch(watchlist -> watchlist.getMovie().equals(movie))){
            throw new DuplicateResourceException("Film znajduje się juz na liście");
        }
        Watchlist newMovie = new Watchlist();
        newMovie.setMovie(movie);
        newMovie.setProfile(profile);

        Watchlist savedItem = watchlistRepository.save(newMovie);
        return toWatchlistResponseDto(savedItem);
    }

    public List<WatchlistResponseDto> getWatchlist(Long userId, Long profileId){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Nie znaleziono użytkownika o ID:" + userId));

        Profile profile = user.getProfiles().stream()
                .filter(p -> p.getId().equals(profileId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Nie znaleziono profilu"));

        return profile.getWatchlists().stream()
                .map(this::toWatchlistResponseDto)
                .toList();
    }

    public void removeMovieFromWatchlist (Long userId, Long profileId, Long movieId){
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new ResourceNotFoundException("Nie znaleziono użytkownika o ID:" + userId));
        Profile profile = user.getProfiles().stream()
                .filter(p -> p.getId().equals(profileId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Nie znaleziono profilu"));

        Watchlist watchlist = profile.getWatchlists().stream()
                .filter(m -> m.getMovie().getId().equals(movieId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Nie znaleziono filmu"));
        profile.getWatchlists().remove(watchlist);

        userRepository.save(user);
    }

    private WatchlistResponseDto toWatchlistResponseDto(Watchlist watchlist) {
        Movie movie = watchlist.getMovie();

        return new WatchlistResponseDto(
                watchlist.getId(),
                watchlist.getProfile().getProfileName(),
                movie.getTitle(),
                toMovieResponseDto(movie)
        );
    }

    private MovieResponseDto toMovieResponseDto(Movie movie) {
        MovieResponseDto movieResponseDto = new MovieResponseDto();
        movieResponseDto.setId(movie.getId());
        movieResponseDto.setTmdbId(movie.getTmdbId());
        movieResponseDto.setTitle(movie.getTitle());
        movieResponseDto.setDescription(movie.getDescription());
        movieResponseDto.setReleaseDate(movie.getReleaseDate());
        movieResponseDto.setThumbnailPath(movie.getThumbnailPath());
        movieResponseDto.setBackgroundPath(movie.getBackgroundPath());
        movieResponseDto.setLogoPath(movie.getLogoPath());

        if (movie.getCategory() != null) {
            movieResponseDto.setCategoryName(movie.getCategory().getName());
        }

        return movieResponseDto;
    }
}