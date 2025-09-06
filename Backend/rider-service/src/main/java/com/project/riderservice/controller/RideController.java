package com.project.riderservice.controller;

import com.project.riderservice.dtos.CreateRideRequestDto;
import com.project.riderservice.dtos.RateDriverRequestDto;
import com.project.riderservice.dtos.RideBookingResponseDto;
import com.project.riderservice.dtos.RideDto;
import com.project.riderservice.exception.InvalidRideStateException;
import com.project.riderservice.service.RideService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rides")
@RequiredArgsConstructor
@Slf4j
public class RideController {

    private final RideService rideService;

    @PostMapping
    public ResponseEntity<RideBookingResponseDto> bookRide(@Valid @RequestBody CreateRideRequestDto createRideRequest) {
        log.info("Book ride request received for customer: {}", createRideRequest.getCustomerId());

        RideBookingResponseDto response = rideService.bookRide(createRideRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<RideDto>> getRides(@RequestParam(required = false) Long customerId,
                                                  @RequestParam(required = false) Long driverId) {
        log.info("Get rides request received - customerId: {}, driverId: {}", customerId, driverId);

        if (customerId != null) {
            List<RideDto> rides = rideService.getRidesByCustomerId(customerId);
            return ResponseEntity.ok(rides);
        } else if (driverId != null) {
            List<RideDto> rides = rideService.getRidesByDriverId(driverId);
            return ResponseEntity.ok(rides);
        } else {
            List<RideDto> rides = rideService.getAllRides();
            return ResponseEntity.ok(rides);
        }
    }

    @PutMapping("/{rideId}/rating")
    public ResponseEntity<RideDto> rateDriver(@PathVariable Long rideId,
                                              @Valid @RequestBody RateDriverRequestDto rateDriverRequest) throws InvalidRideStateException {
        log.info("Rate driver request received for ride: {} with rating: {}", rideId, rateDriverRequest.getRating());

        RideDto ride = rideService.rateDriver(rideId, rateDriverRequest);
        return ResponseEntity.ok(ride);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RideDto> getRideById(@PathVariable Long id) {
        log.info("Get ride by ID request received: {}", id);

        RideDto ride = rideService.getRideById(id);
        return ResponseEntity.ok(ride);
    }
}
