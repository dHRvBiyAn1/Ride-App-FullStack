package com.project.riderservice.service;

import com.project.riderservice.dtos.UserResponseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service", path = "/api/users")
public interface UserServiceClient {

    @GetMapping("/{userId}")
    ResponseEntity<UserResponseDto> getUserById(@PathVariable("userId") Long userId);
}
