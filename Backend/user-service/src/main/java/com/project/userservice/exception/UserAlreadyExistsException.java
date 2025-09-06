package com.project.userservice.exception;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UserAlreadyExistsException extends RuntimeException {
    public UserAlreadyExistsException(String s) {
    }
}
