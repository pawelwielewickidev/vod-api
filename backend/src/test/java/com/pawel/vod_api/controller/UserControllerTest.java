package com.pawel.vod_api.controller;

import com.pawel.vod_api.dto.UserDto;
import com.pawel.vod_api.dto.UserResponseDto;
import com.pawel.vod_api.service.UserService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
public class UserControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @MockitoBean
    private UserService userService;
    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldCreateCreateNewUserAndStatus201() throws Exception{
        UserDto userDto = new UserDto("email@host", "password");
        UserResponseDto mockedResponse = new UserResponseDto(1L, "email@host", null);

        Mockito.when(userService.createUser(Mockito.any(UserDto.class))).thenReturn(mockedResponse);

        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("email@host"));
    }
    @Test
    void shouldReturnUserByIdAndStatus200() throws Exception{
        UserResponseDto mockedResponse = new UserResponseDto(
                1L, "email", null
        );

        Mockito.when(userService.getUserById(1L)).thenReturn(mockedResponse);

        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("email"))
                .andExpect(jsonPath("$.id").value(1L));
    }
}
