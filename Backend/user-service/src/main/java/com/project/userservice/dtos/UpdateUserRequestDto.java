package com.project.userservice.dtos;

import com.project.userservice.enums.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequestDto {
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @Email(message = "Email should be valid")
    private String email;

    private UserStatus status;
}
