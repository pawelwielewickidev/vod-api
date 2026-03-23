package com.pawel.vod_api.service;

import com.pawel.vod_api.dto.ProfileDto;
import com.pawel.vod_api.dto.ProfileResponseDto;
import com.pawel.vod_api.exception.ProfileLimitExceededException;
import com.pawel.vod_api.exception.ResourceNotFoundException;
import com.pawel.vod_api.model.Profile;
import com.pawel.vod_api.model.User;
import com.pawel.vod_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileService {
    private final UserRepository userRepository;

    public ProfileResponseDto createProfile(Long userId, ProfileDto profileDto){
       User user = userRepository.findById(userId).orElseThrow(()-> new ResourceNotFoundException("Brak użytkownika o ID:" + userId));
       if (user.getProfiles().size() >= 5){
           throw new ProfileLimitExceededException("Osiągnięto maksymalną liczbę profili (5)");
       }
        Profile profile = new Profile();
       profile.setProfileName(profileDto.getProfileName());
       profile.setAvatarUrl(profileDto.getAvatarUrl());
       profile.setUser(user);
       user.getProfiles().add(profile);

       userRepository.save(user);

       return new ProfileResponseDto(null, profile.getProfileName(), profile.getAvatarUrl());
       }
    public List<ProfileResponseDto> getAllProfiles(Long userId){
        User user = userRepository.findById(userId).orElseThrow(
                ()-> new ResourceNotFoundException("Brak użytkownika o ID:" + userId)
        );
        List<Profile> profilesFromDb = user.getProfiles();

        return profilesFromDb.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    private ProfileResponseDto mapToDto(Profile profile){
        return new ProfileResponseDto(
                profile.getId(),
                profile.getProfileName(),
                profile.getAvatarUrl()
        );
    }
    }


