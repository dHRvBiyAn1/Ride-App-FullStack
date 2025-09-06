package com.project.driverservice.dtos;

import com.project.driverservice.enums.DriverStatus;
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
public class DriverDto {
    private Long id;
    private String name;
    private String phone;
    private String email;
    private BigDecimal rating;
    private DriverStatus status;
    private VehicleDto vehicle;
    private LocationDto location;
    private Integer totalRides;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
}
