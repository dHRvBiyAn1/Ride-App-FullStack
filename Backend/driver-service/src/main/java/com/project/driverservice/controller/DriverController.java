package com.project.driverservice.controller;

import com.project.driverservice.dtos.CreateDriverRequestDto;
import com.project.driverservice.dtos.DriverDto;
import com.project.driverservice.dtos.RatingRequestDto;
import com.project.driverservice.dtos.UpdateDriverRequestDto;
import com.project.driverservice.exception.DriverAlreadyExistsException;
import com.project.driverservice.service.DriverService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
@Slf4j
public class DriverController {

    private final DriverService driverService;

    @GetMapping("/available")
    public ResponseEntity<List<DriverDto>> getAvailableDrivers() {
        log.info("Get available drivers request received");

        List<DriverDto> drivers = driverService.getAvailableDrivers();
        return ResponseEntity.ok(drivers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DriverDto> getDriverById(@PathVariable Long id) {
        log.info("Get driver request received for ID: {}", id);

        DriverDto driver = driverService.getDriverById(id);
        return ResponseEntity.ok(driver);
    }

    @PostMapping
    public ResponseEntity<DriverDto> createDriver(@Valid @RequestBody CreateDriverRequestDto createDriverRequest) throws DriverAlreadyExistsException {
        log.info("Create driver request received: {}", createDriverRequest.getName());

        DriverDto driver = driverService.createDriver(createDriverRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(driver);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<DriverDto> updateDriverStatus(@PathVariable Long id, @RequestParam String status) {
        log.info("Update driver status request received for ID: {} to status: {}", id, status);

        DriverDto driver = driverService.updateDriverStatus(id, status);
        return ResponseEntity.ok(driver);
    }

    @PutMapping("/{id}/rating")
    public ResponseEntity<DriverDto> updateDriverRating(@PathVariable Long id,
                                                        @Valid @RequestBody RatingRequestDto ratingRequest) {
        log.info("Update driver rating request received for ID: {} with rating: {}", id, ratingRequest.getRating());

        DriverDto driver = driverService.updateDriverRating(id, ratingRequest);
        return ResponseEntity.ok(driver);
    }

    @GetMapping
    public ResponseEntity<List<DriverDto>> getAllDrivers() {
        log.info("Get all drivers request received");

        List<DriverDto> drivers = driverService.getAllDrivers();
        return ResponseEntity.ok(drivers);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DriverDto> updateDriver(@PathVariable Long id,
                                                  @Valid @RequestBody UpdateDriverRequestDto updateDriverRequest) throws DriverAlreadyExistsException {
        log.info("Update driver request received for ID: {}", id);

        DriverDto driver = driverService.updateDriver(id, updateDriverRequest);
        return ResponseEntity.ok(driver);
    }
}
