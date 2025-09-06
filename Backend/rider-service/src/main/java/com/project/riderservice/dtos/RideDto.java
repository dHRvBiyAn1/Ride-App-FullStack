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
public class RideDto {
    private Long id;
    private Long customerId;
    private Long driverId;
    private String customerName;
    private String driverName;
    private String pickupLocation;
    private String destinationLocation;
    private RideStatus status;
    private RideType rideType;
    private BigDecimal estimatedFare;
    private BigDecimal actualFare;
    private BigDecimal distance;
    private Integer estimatedDuration;
    private Integer actualDuration;
    private Integer driverRating;
    private Integer customerRating;
    private LocalDateTime pickupTime;
    private LocalDateTime completionTime;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
}
