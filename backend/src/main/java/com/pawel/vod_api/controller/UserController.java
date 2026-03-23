package com.pawel.vod_api.controller;

import com.pawel.vod_api.dto.UserDto;
import com.pawel.vod_api.dto.UserResponseDto;
import com.pawel.vod_api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping("/users")
    public ResponseEntity<UserResponseDto> createNewUser(@RequestBody UserDto userDto){
        UserResponseDto response = userService.createUser(userDto);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    @GetMapping("/users/{id}")
    public UserResponseDto returnUserById(@PathVariable Long id){
        return userService.getUserById(id);
    }

}
