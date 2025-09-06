package com.project.userservice.service;

import com.project.userservice.dtos.*;
import com.project.userservice.entity.User;
import com.project.userservice.enums.UserRole;
import com.project.userservice.enums.UserStatus;
import com.project.userservice.exception.ResourceNotFoundException;
import com.project.userservice.exception.UserAlreadyExistsException;
import com.project.userservice.repository.UserRepository;
import com.project.userservice.utils.UserMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.auth.InvalidCredentialsException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Transactional
    public LoginResponseDto authenticateUser(LoginRequestDto loginRequest) throws InvalidCredentialsException {
        log.info("Authenticating user: {}", loginRequest.getUsername());

        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid username or password"));

        if (!user.getPassword().equals(loginRequest.getPassword())) {
            throw new InvalidCredentialsException("Invalid username or password");
        }

        if (!UserStatus.ACTIVE.equals(user.getStatus())) {
            throw new InvalidCredentialsException("Account is not active");
        }

        log.info("User authenticated successfully: {}", user.getUsername());

        return userMapper.toLoginResponseDto(user);
    }

    @Transactional
    public UserDto getUserById(Long id) {
        log.info("Fetching user by ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        return userMapper.toDto(user);
    }

    @Transactional
    public List<UserDto> getUsersByRole(String roleStr) {
        log.info("Fetching users by role: {}", roleStr);

        try {
            UserRole role = UserRole.valueOf(roleStr.toUpperCase());
            List<User> users = userRepository.findByRole(role);
            return userMapper.toDtoList(users);
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException("Invalid role: " + roleStr);
        }
    }

    public UserDto createUser(CreateUserRequestDto createUserRequest) {
        log.info("Creating new user: {}", createUserRequest.getUsername());

        if (userRepository.existsByUsername(createUserRequest.getUsername())) {
            throw new UserAlreadyExistsException("Username already exists: " + createUserRequest.getUsername());
        }

        if (userRepository.existsByEmail(createUserRequest.getEmail())) {
            throw new UserAlreadyExistsException("Email already exists: " + createUserRequest.getEmail());
        }

        User user = userMapper.toEntity(createUserRequest);
        User savedUser = userRepository.save(user);

        log.info("User created successfully: {}", savedUser.getUsername());

        return userMapper.toDto(savedUser);
    }

    public UserDto updateUser(Long id, UpdateUserRequestDto updateUserRequest) {
        log.info("Updating user: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        // Check email uniqueness if email is being updated
        if (updateUserRequest.getEmail() != null &&
                !updateUserRequest.getEmail().equals(user.getEmail()) &&
                userRepository.existsByEmail(updateUserRequest.getEmail())) {
            throw new UserAlreadyExistsException("Email already exists: " + updateUserRequest.getEmail());
        }

        userMapper.updateEntityFromDto(updateUserRequest, user);
        User updatedUser = userRepository.save(user);

        log.info("User updated successfully: {}", updatedUser.getUsername());

        return userMapper.toDto(updatedUser);
    }

    public UserDto updateUserStatus(Long id, String statusStr) {
        log.info("Updating user status: {} to {}", id, statusStr);

        try {
            UserStatus status = UserStatus.valueOf(statusStr.toUpperCase());

            User user = userRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

            user.setStatus(status);
            User updatedUser = userRepository.save(user);

            log.info("User status updated successfully: {}", updatedUser.getUsername());

            return userMapper.toDto(updatedUser);
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException("Invalid status: " + statusStr);
        }
    }

    @Transactional
    public List<UserDto> getAllUsers() {
        log.info("Fetching all users");

        List<User> users = userRepository.findAll();
        return userMapper.toDtoList(users);
    }
}
