package com.pawel.vod_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileDto {
    @NotBlank(message = "Nazwa profilu nie może być pusta")
    @Size(min = 2, max = 50, message = "Nazwa profilu może mieć od 2 do 50 znaków")
    private String profileName;

    private String avatarUrl;
}
