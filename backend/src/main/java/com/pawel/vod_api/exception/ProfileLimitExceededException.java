package com.pawel.vod_api.exception;

public class ProfileLimitExceededException extends RuntimeException {
    public ProfileLimitExceededException(String message) {
        super(message);
    }
}
