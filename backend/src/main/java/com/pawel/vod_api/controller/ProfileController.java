package com.pawel.vod_api.controller;

import com.pawel.vod_api.dto.ProfileDto;
import com.pawel.vod_api.dto.ProfileResponseDto;
import com.pawel.vod_api.service.ProfileService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @PostMapping("/{userId}/profiles")
    public ResponseEntity<ProfileResponseDto> createNewProfile(@PathVariable Long userId,@Valid @RequestBody ProfileDto profileDto){
        ProfileResponseDto response = profileService.createProfile(userId, profileDto);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    @GetMapping("/{userId}/profiles")
    public List<ProfileResponseDto> getAllProfiles(@PathVariable Long userId){
        return profileService.getAllProfiles(userId);
    }

    @PatchMapping("/{userId}/profiles/{profileId}")
    public ResponseEntity<ProfileResponseDto> changeAvatar(@PathVariable Long userId, @PathVariable Long profileId, @Valid @RequestBody ProfileDto profileDto){
        ProfileResponseDto response = profileService.changeAvatar(profileId, userId, profileDto);
        return ResponseEntity.ok(response);
    }
    @Transactional
    @PutMapping("/{userId}/profiles/{profileId}")
    public ResponseEntity<ProfileResponseDto> changeProfileData(@PathVariable Long userId,  @PathVariable Long profileId, @Valid @RequestBody ProfileDto profileDto){
        ProfileResponseDto response = profileService.changeProfileData(userId, profileId, profileDto);
        return ResponseEntity.ok(response);

    }
    @Transactional
    @DeleteMapping("/{userId}/profiles/{profileId}")
    public ResponseEntity<Void> deleteProfile(@PathVariable Long userId, @PathVariable Long profileId){
        profileService.deleteProfile(userId, profileId);
        return ResponseEntity.noContent().build();

    }
}
