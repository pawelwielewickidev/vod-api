package com.pawel.vod_api.service;

import com.pawel.vod_api.dto.PlaybackProgressRequestDto;
import com.pawel.vod_api.dto.PlaybackProgressResponseDto;
import com.pawel.vod_api.exception.ResourceNotFoundException;
import com.pawel.vod_api.model.Episode;
import com.pawel.vod_api.model.PlaybackProgress;
import com.pawel.vod_api.model.Profile;
import com.pawel.vod_api.model.User;
import com.pawel.vod_api.repository.EpisodeRepository;
import com.pawel.vod_api.repository.PlaybackProgressRepository;
import com.pawel.vod_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlaybackProgressService {

    private final PlaybackProgressRepository playbackProgressRepository;
    private final UserRepository userRepository;
    private final EpisodeRepository episodeRepository;

    @Transactional
    public PlaybackProgressResponseDto saveOrUpdateProgress(
            Long userId,
            Long profileId,
            Long episodeId,
            PlaybackProgressRequestDto request
    ) {
        validateTimestamp(request.timestampSeconds());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Nie znaleziono użytkownika o ID: " + userId));

        Profile profile = getProfileFromUser(user, profileId);

        Episode episode = episodeRepository.findById(episodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Nie znaleziono odcinka o ID: " + episodeId));

        PlaybackProgress progress = playbackProgressRepository
                .findByProfileIdAndEpisodeId(profileId, episodeId)
                .orElseGet(() -> {
                    PlaybackProgress newProgress = new PlaybackProgress();
                    newProgress.setProfile(profile);
                    newProgress.setEpisode(episode);
                    return newProgress;
                });

        progress.setTimestampSeconds(request.timestampSeconds());
        progress.setCompleted(request.completed());

        PlaybackProgress savedProgress = playbackProgressRepository.save(progress);

        return toResponseDto(savedProgress);
    }

    @Transactional(readOnly = true)
    public PlaybackProgressResponseDto getProgress(Long userId, Long profileId, Long episodeId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Nie znaleziono użytkownika o ID: " + userId));

        getProfileFromUser(user, profileId);

        PlaybackProgress progress = playbackProgressRepository.findByProfileIdAndEpisodeId(profileId, episodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Nie znaleziono postępu oglądania dla odcinka o ID: " + episodeId));

        return toResponseDto(progress);
    }

    @Transactional(readOnly = true)
    public List<PlaybackProgressResponseDto> getProfileProgress(Long userId, Long profileId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Nie znaleziono użytkownika o ID: " + userId));

        getProfileFromUser(user, profileId);

        return playbackProgressRepository.findByProfileIdOrderByUpdatedAtDesc(profileId)
                .stream()
                .map(this::toResponseDto)
                .toList();
    }

    @Transactional
    public void deleteProgress(Long userId, Long profileId, Long episodeId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Nie znaleziono użytkownika o ID: " + userId));

        getProfileFromUser(user, profileId);

        PlaybackProgress progress = playbackProgressRepository.findByProfileIdAndEpisodeId(profileId, episodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Nie znaleziono postępu oglądania dla odcinka o ID: " + episodeId));

        playbackProgressRepository.delete(progress);
    }

    private PlaybackProgressResponseDto toResponseDto(PlaybackProgress progress) {
        Episode episode = progress.getEpisode();

        return new PlaybackProgressResponseDto(
                progress.getId(),
                progress.getProfile().getId(),
                episode.getId(),
                episode.getMovie() != null ? episode.getMovie().getId() : null,
                episode.getMovie() != null ? episode.getMovie().getTitle() : null,
                episode.getTitle(),
                episode.getEpisodeNumber(),
                progress.getTimestampSeconds(),
                progress.isCompleted(),
                progress.getUpdatedAt()
        );
    }

    private Profile getProfileFromUser(User user, Long profileId) {
        return user.getProfiles().stream()
                .filter(profile -> profile.getId().equals(profileId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Nie znaleziono profilu o ID: " + profileId));
    }

    private void validateTimestamp(Integer timestampSeconds) {
        if (timestampSeconds == null || timestampSeconds < 0) {
            throw new IllegalArgumentException("Czas oglądania nie może być pusty ani ujemny");
        }
    }
}