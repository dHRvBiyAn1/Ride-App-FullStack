package com.project.riderservice.dtos;

import com.project.riderservice.enums.RideStatus;
import com.project.riderservice.enums.RideType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RideBookingResponseDto {
    private Long rideId;
    private String customerName;
    private String driverName;
    private String pickupLocation;
    private String destinationLocation;
    private RideStatus status;
    private RideType rideType;
    private BigDecimal estimatedFare;
    private BigDecimal distance;
    private Integer estimatedDuration;
    private LocalDateTime bookingTime;
    private String message;
    private DriverDetailsDto driverDetails;
}
