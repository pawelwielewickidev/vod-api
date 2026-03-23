package com.pawel.vod_api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleResourceNotFound(ResourceNotFoundException ex) {
        ErrorResponseDto errorResponseDto = new ErrorResponseDto(
                ex.getMessage(), HttpStatus.NOT_FOUND.value(), LocalDateTime.now());
        return new ResponseEntity<>(errorResponseDto, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDto> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        String errorMessage =ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        ErrorResponseDto errorResponseDto = new ErrorResponseDto(
                errorMessage, HttpStatus.BAD_REQUEST.value(), LocalDateTime.now());
        return new ResponseEntity<>(errorResponseDto, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ProfileLimitExceededException.class)
    public ResponseEntity<ErrorResponseDto> handleProfileLimitExceeded(ProfileLimitExceededException ex) {
        ErrorResponseDto errorResponseDto = new ErrorResponseDto(
                ex.getMessage(), HttpStatus.BAD_REQUEST.value(), LocalDateTime.now());
        return new ResponseEntity<>(errorResponseDto, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponseDto> handleDuplicateResource(DuplicateResourceException ex) {
        ErrorResponseDto errorResponseDto = new ErrorResponseDto(
                ex.getMessage(), HttpStatus.CONFLICT.value(), LocalDateTime.now());
        return new ResponseEntity<>(errorResponseDto, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponseDto> handleRuntimeException(RuntimeException ex) {
        String errorMessage = ex.getMessage();

        ErrorResponseDto errorResponseDto = new ErrorResponseDto(
                errorMessage, HttpStatus.BAD_REQUEST.value(), LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponseDto);
    }
}
