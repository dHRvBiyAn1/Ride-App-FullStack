package com.project.riderservice.service;

import com.project.riderservice.dtos.DriverRatingRequestDto;
import com.project.riderservice.dtos.DriverResponseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "driver-service", path = "/api/drivers")
public interface DriverServiceClient {

    @GetMapping("/available")
    ResponseEntity<List<DriverResponseDto>> getAvailableDrivers();

    @GetMapping("/{driverId}")
    ResponseEntity<DriverResponseDto> getDriverById(@PathVariable("driverId") Long driverId);

    @PutMapping("/{driverId}/rating")
    ResponseEntity<DriverResponseDto> updateDriverRating(@PathVariable("driverId") Long driverId,
                                                         @RequestBody DriverRatingRequestDto ratingRequest);
}
