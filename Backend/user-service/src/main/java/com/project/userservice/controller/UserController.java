package com.project.userservice.controller;

import com.project.userservice.dtos.*;
import com.project.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.auth.InvalidCredentialsException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto loginRequest) throws InvalidCredentialsException {
        log.info("Login request received for username: {}", loginRequest.getUsername());

        LoginResponseDto response = userService.authenticateUser(loginRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        log.info("Get user request received for ID: {}", id);

        UserDto user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<UserDto>> getUsersByRole(@PathVariable String role) {
        log.info("Get users by role request received: {}", role);

        List<UserDto> users = userService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }

    @PostMapping
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody CreateUserRequestDto createUserRequest) {
        log.info("Create user request received: {}", createUserRequest.getUsername());

        UserDto user = userService.createUser(createUserRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id,
                                              @Valid @RequestBody UpdateUserRequestDto updateUserRequest) {
        log.info("Update user request received for ID: {}", id);

        UserDto user = userService.updateUser(id, updateUserRequest);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<UserDto> updateUserStatus(@PathVariable Long id, @RequestParam String status) {
        log.info("Update user status request received for ID: {} to status: {}", id, status);

        UserDto user = userService.updateUserStatus(id, status);
        return ResponseEntity.ok(user);
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        log.info("Get all users request received");

        List<UserDto> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }
}
