package com.project.userservice.dtos;

import com.project.userservice.enums.UserRole;
import com.project.userservice.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDto {
    private Long id;
    private String username;
    private String name;
    private String email;
    private UserRole role;
    private UserStatus status;
    private String message;
}