package com.pawel.vod_api.service;

import com.pawel.vod_api.dto.ProfileDto;
import com.pawel.vod_api.model.Profile;
import com.pawel.vod_api.model.User;
import com.pawel.vod_api.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;

@ExtendWith(MockitoExtension.class)
public class ProfileServiceTest {
    @Mock
    private UserRepository userRepository;
    @InjectMocks
    private ProfileService profileService;

    @Test
    void shouldNotBeAbleToCreateMoreThan5Profiles(){
        User userWithFiveProfiles = new User();
        userWithFiveProfiles.setId(1L);
        userWithFiveProfiles.setProfiles(List.of(
                new Profile(), new Profile(), new Profile(), new Profile(), new Profile()
        ));
        ProfileDto newProfileDto = new ProfileDto("szósty profil", "avata.jpg");

        Mockito.when(userRepository.findById(1L)).thenReturn(Optional.of(userWithFiveProfiles));

        assertThrows(RuntimeException.class, ()-> profileService.createProfile(1L, newProfileDto));
    }

}
