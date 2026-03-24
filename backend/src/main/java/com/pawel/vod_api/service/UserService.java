package com.pawel.vod_api.service;


import com.pawel.vod_api.dto.UserDto;
import com.pawel.vod_api.dto.UserResponseDto;
import com.pawel.vod_api.exception.ResourceNotFoundException;
import com.pawel.vod_api.model.User;
import com.pawel.vod_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public UserResponseDto createUser(UserDto userDto){

        if(userRepository.existsByEmail(userDto.getEmail())){
            throw new ResourceNotFoundException("Użytkownik z tym adresem email już istnieje.");
        }
        User user = new User();
        user.setEmail(userDto.getEmail());
        user.setPassword(userDto.getPassword());

        userRepository.save(user);

        return new UserResponseDto(user.getId(),user.getEmail(), null);
    }
    public UserResponseDto getUserById(Long id){
        User user = userRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Brak użytkownika o ID:" + id)
        );
        return new UserResponseDto(
                user.getId(),
                user.getEmail(),
                user.getRole()
        );
    }
}
