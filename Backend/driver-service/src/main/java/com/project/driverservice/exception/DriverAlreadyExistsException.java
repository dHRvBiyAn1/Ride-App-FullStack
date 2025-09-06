package com.project.driverservice.exception;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class DriverAlreadyExistsException extends Throwable {
    public DriverAlreadyExistsException(String s) {
    }
}
