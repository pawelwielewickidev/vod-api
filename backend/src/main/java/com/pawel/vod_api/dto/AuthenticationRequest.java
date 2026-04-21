package com.pawel.vod_api.dto;

public record AuthenticationRequest(
        String email,
        String password
) {}
