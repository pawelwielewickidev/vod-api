package com.pawel.vod_api.controller;

import com.pawel.vod_api.dto.ProfileDto;
import com.pawel.vod_api.dto.ProfileResponseDto;
import com.pawel.vod_api.service.JwtService;
import com.pawel.vod_api.service.ProfileService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProfileController.class)
public class ProfileControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @MockitoBean
    private ProfileService profileService;
    @Autowired
    private ObjectMapper objectMapper;
    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @MockitoBean
    private AuthenticationProvider authenticationProvider;
    @Test
    @WithMockUser(username = "admin@admin.com", roles = {"USER"})
    void shouldCreateNewProfileAndStatus201() throws Exception{
        ProfileDto requestDto = new ProfileDto("Profile1", "url");
        ProfileResponseDto mockedResponse = new ProfileResponseDto(1L, "Profile1", "url");

        Mockito.when(profileService.createProfile(Mockito.eq(1L), Mockito.any(ProfileDto.class))).thenReturn(mockedResponse);

        mockMvc.perform(post("/api/users/{userId}/profiles", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.profileName").value("Profile1"))
                .andExpect(jsonPath("$.avatarUrl").value("url"));
    }
    @Test
    @WithMockUser(username = "admin@admin.com", roles = {"USER"})
    void shouldReturnAllProfilesAndStatus200() throws Exception{
        ProfileResponseDto profile = new ProfileResponseDto(
                1L, "profil", "avatarUrl"
        );
        Mockito.when(profileService.getAllProfiles(1L)).thenReturn(List.of(profile));

        mockMvc.perform(get("/api/users/1/profiles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].profileName").value("profil"))
                .andExpect(jsonPath("$[0].avatarUrl").value("avatarUrl"));
    }
    @Test
    @WithMockUser(username = "admin@admin.com", roles = {"USER"})
    void shouldUpdateProfileAndStatus200() throws Exception{
        ProfileResponseDto profile = new ProfileResponseDto(4L, "profil", "avatarUrl");
        Mockito.when(profileService.changeAvatar(4L, 1L, new ProfileDto("profil", "avatarUrl"))).thenReturn(profile);

        mockMvc.perform(patch("/api/users/1/profiles/4")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ProfileDto("profil", "avatarUrl"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profileName").value("profil"))
                .andExpect(jsonPath("$.avatarUrl").value("avatarUrl"));
    }
    @Test
    @WithMockUser(username = "admin@admin.com", roles = {"USER"})
    void shouldDeleteProfileAndStatus204() throws Exception {
        Mockito.doNothing().when(profileService).deleteProfile(1L, 4L);
        mockMvc.perform(delete("/api/users/1/profiles/4"))
                .andExpect(status().isNoContent());
    }
    @Test
    @WithMockUser(username = "admin@admin.com", roles = {"USER"})
    void shouldUpdateProfileDataAndStatus200() throws Exception {
        ProfileResponseDto profile = new ProfileResponseDto(4L, "profil", "avatarUrl");
        Mockito.when(profileService.changeProfileData(1L, 4L, new ProfileDto("profil", "avatarUrl"))).thenReturn(profile);

        mockMvc.perform(put("/api/users/1/profiles/4")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ProfileDto("profil", "avatarUrl"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profileName").value("profil"))
                .andExpect(jsonPath("$.avatarUrl").value("avatarUrl"));
    }
}
