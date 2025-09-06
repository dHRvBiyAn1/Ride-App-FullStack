package com.project.riderservice.service;

import com.project.riderservice.dtos.*;
import com.project.riderservice.entity.Ride;
import com.project.riderservice.enums.RideStatus;
import com.project.riderservice.exception.InvalidRideStateException;
import com.project.riderservice.exception.ResourceNotFoundException;
import com.project.riderservice.exception.RideBookingException;
import com.project.riderservice.repository.RideRepository;
import com.project.riderservice.utils.RideMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RideService {

    private final RideRepository rideRepository;
    private final RideMapper rideMapper;
    private final UserServiceClient userServiceClient;
    private final DriverServiceClient driverServiceClient;
    private final PaymentServiceClient paymentServiceClient;

    public RideBookingResponseDto bookRide(CreateRideRequestDto createRideRequest) {
        log.info("Booking ride for customer: {}", createRideRequest.getCustomerId());

        try {
            // Step 1: Validate customer
            ResponseEntity<UserResponseDto> userResponse = userServiceClient.getUserById(createRideRequest.getCustomerId());
            if (!userResponse.getStatusCode().is2xxSuccessful() || userResponse.getBody() == null) {
                throw new RideBookingException("Customer not found");
            }

            UserResponseDto customer = userResponse.getBody();
            if (!"ACTIVE".equals(customer.getStatus())) {
                throw new RideBookingException("Customer account is not active");
            }

            // Step 2: Get available drivers
            ResponseEntity<List<DriverResponseDto>> driversResponse = driverServiceClient.getAvailableDrivers();
            if (!driversResponse.getStatusCode().is2xxSuccessful() ||
                    driversResponse.getBody() == null || driversResponse.getBody().isEmpty()) {
                throw new RideBookingException("No drivers available at the moment");
            }

            List<DriverResponseDto> availableDrivers = driversResponse.getBody();
            DriverResponseDto selectedDriver = selectBestDriver(availableDrivers);

            // Step 3: Calculate fare
            FareCalculationRequestDto fareRequest = FareCalculationRequestDto.builder()
                    .pickupLocation(createRideRequest.getPickupLocation())
                    .destinationLocation(createRideRequest.getDestinationLocation())
                    .rideType(createRideRequest.getRideType().name())
                    .build();

            ResponseEntity<FareCalculationResponseDto> fareResponse = paymentServiceClient.calculateFare(fareRequest);
            if (!fareResponse.getStatusCode().is2xxSuccessful() || fareResponse.getBody() == null) {
                throw new RideBookingException("Failed to calculate fare");
            }

            FareCalculationResponseDto fareCalculation = fareResponse.getBody();

            // Step 4: Create ride
            Ride ride = rideMapper.toEntity(createRideRequest);
            ride.setDriverId(selectedDriver.getId());
            ride.setCustomerName(customer.getName());
            ride.setDriverName(selectedDriver.getName());
            ride.setStatus(RideStatus.CONFIRMED);
            ride.setEstimatedFare(fareCalculation.getEstimatedFare());
            ride.setDistance(fareCalculation.getDistance());
            ride.setEstimatedDuration(fareCalculation.getEstimatedDuration());

            Ride savedRide = rideRepository.save(ride);

            log.info("Ride booked successfully: {}", savedRide.getId());

            return rideMapper.toBookingResponseDto(savedRide, customer, selectedDriver);

        } catch (Exception e) {
            log.error("Error booking ride: {}", e.getMessage(), e);
            if (e instanceof RideBookingException) {
                throw e;
            }
            throw new RideBookingException("Failed to book ride: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<RideDto> getRidesByCustomerId(Long customerId) {
        log.info("Fetching rides for customer: {}", customerId);

        List<Ride> rides = rideRepository.findByCustomerIdOrderByCreatedDateDesc(customerId);
        return rideMapper.toDtoList(rides);
    }

    @Transactional(readOnly = true)
    public List<RideDto> getRidesByDriverId(Long driverId) {
        log.info("Fetching rides for driver: {}", driverId);

        List<Ride> rides = rideRepository.findByDriverIdOrderByCreatedDateDesc(driverId);
        return rideMapper.toDtoList(rides);
    }

    public RideDto rateDriver(Long rideId, RateDriverRequestDto rateDriverRequest) throws InvalidRideStateException {
        log.info("Rating driver for ride: {} with rating: {}", rideId, rateDriverRequest.getRating());

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with id: " + rideId));

        if (!RideStatus.COMPLETED.equals(ride.getStatus())) {
            // Auto-complete ride for rating if it's confirmed or in progress
            if (RideStatus.CONFIRMED.equals(ride.getStatus()) || RideStatus.IN_PROGRESS.equals(ride.getStatus())) {
                ride.setStatus(RideStatus.COMPLETED);
                ride.setCompletionTime(LocalDateTime.now());
            } else {
                throw new InvalidRideStateException("Cannot rate driver for ride in current state: " + ride.getStatus());
            }
        }

        if (ride.getDriverRating() != null) {
            throw new InvalidRideStateException("Driver has already been rated for this ride");
        }

        ride.setDriverRating(rateDriverRequest.getRating());

        try {
            // Update driver rating through Feign client
            DriverRatingRequestDto driverRatingRequest = DriverRatingRequestDto.builder()
                    .rating(rateDriverRequest.getRating())
                    .rideId(rideId)
                    .build();

            driverServiceClient.updateDriverRating(ride.getDriverId(), driverRatingRequest);
            log.info("Driver rating updated successfully for ride: {}", rideId);
        } catch (Exception e) {
            log.warn("Failed to update driver rating in driver service: {}", e.getMessage());
            // Continue with local update even if remote call fails
        }

        Ride updatedRide = rideRepository.save(ride);

        log.info("Driver rated successfully for ride: {}", rideId);

        return rideMapper.toDto(updatedRide);
    }

    @Transactional(readOnly = true)
    public List<RideDto> getAllRides() {
        log.info("Fetching all rides");

        List<Ride> rides = rideRepository.findAll();
        return rideMapper.toDtoList(rides);
    }

    @Transactional(readOnly = true)
    public RideDto getRideById(Long id) {
        log.info("Fetching ride by ID: {}", id);

        Ride ride = rideRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with id: " + id));

        return rideMapper.toDto(ride);
    }

    private DriverResponseDto selectBestDriver(List<DriverResponseDto> drivers) {
        // Simple selection logic - in real implementation, consider:
        // 1. Distance from pickup location
        // 2. Driver rating
        // 3. Driver availability status
        // For now, select a random available driver
        Random random = new Random();
        return drivers.get(random.nextInt(drivers.size()));
    }
}
