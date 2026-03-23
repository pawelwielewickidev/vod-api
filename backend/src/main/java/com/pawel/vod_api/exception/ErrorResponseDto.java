package com.pawel.vod_api.exception;


import java.time.LocalDateTime;

public record ErrorResponseDto(String message, int status, LocalDateTime timestamp) {

}
