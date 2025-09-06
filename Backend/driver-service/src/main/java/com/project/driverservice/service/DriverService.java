package com.project.driverservice.service;


import com.project.driverservice.dtos.CreateDriverRequestDto;
import com.project.driverservice.dtos.DriverDto;
import com.project.driverservice.dtos.RatingRequestDto;
import com.project.driverservice.dtos.UpdateDriverRequestDto;
import com.project.driverservice.entity.Driver;
import com.project.driverservice.enums.DriverStatus;
import com.project.driverservice.exception.DriverAlreadyExistsException;
import com.project.driverservice.exception.ResourceNotFoundException;
import com.project.driverservice.repository.DriverRepository;
import com.project.driverservice.utils.DriverMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DriverService {

    private final DriverRepository driverRepository;
    private final DriverMapper driverMapper;

    @Transactional(readOnly = true)
    public List<DriverDto> getAvailableDrivers() {
        log.info("Fetching available drivers");

        List<Driver> drivers = driverRepository.findByStatus(DriverStatus.ACTIVE);
        return driverMapper.toDtoList(drivers);
    }

    @Transactional(readOnly = true)
    public DriverDto getDriverById(Long id) {
        log.info("Fetching driver by ID: {}", id);

        Driver driver = driverRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + id));

        return driverMapper.toDto(driver);
    }

    public DriverDto createDriver(CreateDriverRequestDto createDriverRequest) throws DriverAlreadyExistsException {
        log.info("Creating new driver: {}", createDriverRequest.getName());

        if (driverRepository.existsByEmail(createDriverRequest.getEmail())) {
            throw new DriverAlreadyExistsException("Email already exists: " + createDriverRequest.getEmail());
        }

        if (driverRepository.existsByPhone(createDriverRequest.getPhone())) {
            throw new DriverAlreadyExistsException("Phone already exists: " + createDriverRequest.getPhone());
        }

        Driver driver = driverMapper.toEntity(createDriverRequest);
        Driver savedDriver = driverRepository.save(driver);

        log.info("Driver created successfully: {}", savedDriver.getName());

        return driverMapper.toDto(savedDriver);
    }

    public DriverDto updateDriverStatus(Long id, String statusStr) {
        log.info("Updating driver status: {} to {}", id, statusStr);

        try {
            DriverStatus status = DriverStatus.valueOf(statusStr.toUpperCase());

            Driver driver = driverRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + id));

            driver.setStatus(status);
            Driver updatedDriver = driverRepository.save(driver);

            log.info("Driver status updated successfully: {}", updatedDriver.getName());

            return driverMapper.toDto(updatedDriver);
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException("Invalid status: " + statusStr);
        }
    }

    public DriverDto updateDriverRating(Long driverId, RatingRequestDto ratingRequest) {
        log.info("Updating driver rating: {} with rating: {}", driverId, ratingRequest.getRating());

        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + driverId));

        // Calculate new average rating
        BigDecimal currentRating = driver.getRating();
        int totalRides = driver.getTotalRides();

        BigDecimal newRating;
        if (totalRides == 0) {
            newRating = BigDecimal.valueOf(ratingRequest.getRating());
        } else {
            BigDecimal totalPoints = currentRating.multiply(BigDecimal.valueOf(totalRides));
            totalPoints = totalPoints.add(BigDecimal.valueOf(ratingRequest.getRating()));
            newRating = totalPoints.divide(BigDecimal.valueOf(totalRides + 1), 2, RoundingMode.HALF_UP);
        }

        driver.setRating(newRating);
        driver.setTotalRides(totalRides + 1);

        Driver updatedDriver = driverRepository.save(driver);

        log.info("Driver rating updated successfully: {}", updatedDriver.getName());

        return driverMapper.toDto(updatedDriver);
    }

    @Transactional(readOnly = true)
    public List<DriverDto> getAllDrivers() {
        log.info("Fetching all drivers");

        List<Driver> drivers = driverRepository.findAll();
        return driverMapper.toDtoList(drivers);
    }

    public DriverDto updateDriver(Long id, UpdateDriverRequestDto updateDriverRequest) throws DriverAlreadyExistsException {
        log.info("Updating driver: {}", id);

        Driver driver = driverRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + id));

        // Check email uniqueness if email is being updated
        if (updateDriverRequest.getEmail() != null &&
                !updateDriverRequest.getEmail().equals(driver.getEmail()) &&
                driverRepository.existsByEmail(updateDriverRequest.getEmail())) {
            throw new DriverAlreadyExistsException("Email already exists: " + updateDriverRequest.getEmail());
        }

        // Check phone uniqueness if phone is being updated
        if (updateDriverRequest.getPhone() != null &&
                !updateDriverRequest.getPhone().equals(driver.getPhone()) &&
                driverRepository.existsByPhone(updateDriverRequest.getPhone())) {
            throw new DriverAlreadyExistsException("Phone already exists: " + updateDriverRequest.getPhone());
        }

        driverMapper.updateEntityFromDto(updateDriverRequest, driver);
        Driver updatedDriver = driverRepository.save(driver);

        log.info("Driver updated successfully: {}", updatedDriver.getName());

        return driverMapper.toDto(updatedDriver);
    }
}
