package com.project.riderservice.utils;

import com.project.riderservice.dtos.*;
import com.project.riderservice.entity.Ride;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class RideMapper {

    public RideDto toDto(Ride ride) {
        if (ride == null) {
            return null;
        }

        return RideDto.builder()
                .id(ride.getId())
                .customerId(ride.getCustomerId())
                .driverId(ride.getDriverId())
                .customerName(ride.getCustomerName())
                .driverName(ride.getDriverName())
                .pickupLocation(ride.getPickupLocation())
                .destinationLocation(ride.getDestinationLocation())
                .status(ride.getStatus())
                .rideType(ride.getRideType())
                .estimatedFare(ride.getEstimatedFare())
                .actualFare(ride.getActualFare())
                .distance(ride.getDistance())
                .estimatedDuration(ride.getEstimatedDuration())
                .actualDuration(ride.getActualDuration())
                .driverRating(ride.getDriverRating())
                .customerRating(ride.getCustomerRating())
                .pickupTime(ride.getPickupTime())
                .completionTime(ride.getCompletionTime())
                .createdDate(ride.getCreatedDate())
                .updatedDate(ride.getUpdatedDate())
                .build();
    }

    public List<RideDto> toDtoList(List<Ride> rides) {
        if (rides == null) {
            return null;
        }

        return rides.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public Ride toEntity(CreateRideRequestDto dto) {
        if (dto == null) {
            return null;
        }

        return Ride.builder()
                .customerId(dto.getCustomerId())
                .pickupLocation(dto.getPickupLocation())
                .destinationLocation(dto.getDestinationLocation())
                .rideType(dto.getRideType())
                .build();
    }

    public RideBookingResponseDto toBookingResponseDto(Ride ride, UserResponseDto customer, DriverResponseDto driver) {
        if (ride == null) {
            return null;
        }

        DriverDetailsDto driverDetails = null;
        if (driver != null) {
            VehicleDetailsDto vehicleDetails = null;
            if (driver.getVehicle() != null) {
                vehicleDetails = VehicleDetailsDto.builder()
                        .model(driver.getVehicle().getModel())
                        .plateNumber(driver.getVehicle().getPlateNumber())
                        .color(driver.getVehicle().getColor())
                        .build();
            }

            driverDetails = DriverDetailsDto.builder()
                    .id(driver.getId())
                    .name(driver.getName())
                    .phone(driver.getPhone())
                    .rating(driver.getRating())
                    .vehicle(vehicleDetails)
                    .build();
        }

        return RideBookingResponseDto.builder()
                .rideId(ride.getId())
                .customerName(customer != null ? customer.getName() : null)
                .driverName(driver != null ? driver.getName() : null)
                .pickupLocation(ride.getPickupLocation())
                .destinationLocation(ride.getDestinationLocation())
                .status(ride.getStatus())
                .rideType(ride.getRideType())
                .estimatedFare(ride.getEstimatedFare())
                .distance(ride.getDistance())
                .estimatedDuration(ride.getEstimatedDuration())
                .bookingTime(ride.getCreatedDate())
                .message("Ride booked successfully!")
                .driverDetails(driverDetails)
                .build();
    }
}
