package com.project.userservice.utils;


import com.project.userservice.dtos.CreateUserRequestDto;
import com.project.userservice.dtos.LoginResponseDto;
import com.project.userservice.dtos.UpdateUserRequestDto;
import com.project.userservice.dtos.UserDto;
import com.project.userservice.entity.User;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class UserMapper {

    public UserDto toDto(User user) {
        if (user == null) {
            return null;
        }

        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .createdDate(user.getCreatedDate())
                .updatedDate(user.getUpdatedDate())
                .build();
    }

    public List<UserDto> toDtoList(List<User> users) {
        if (users == null) {
            return null;
        }

        return users.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public LoginResponseDto toLoginResponseDto(User user) {
        if (user == null) {
            return null;
        }

        return LoginResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .message("Login successful")
                .build();
    }

    public User toEntity(CreateUserRequestDto dto) {
        if (dto == null) {
            return null;
        }

        return User.builder()
                .username(dto.getUsername())
                .password(dto.getPassword())
                .name(dto.getName())
                .email(dto.getEmail())
                .role(dto.getRole())
                .build();
    }

    public void updateEntityFromDto(UpdateUserRequestDto dto, User user) {
        if (dto == null || user == null) {
            return;
        }

        if (dto.getName() != null) {
            user.setName(dto.getName());
        }
        if (dto.getEmail() != null) {
            user.setEmail(dto.getEmail());
        }
        if (dto.getStatus() != null) {
            user.setStatus(dto.getStatus());
        }
    }
}

