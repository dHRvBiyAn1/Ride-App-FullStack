package com.project.riderservice.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverResponseDto {
    private Long id;
    private String name;
    private String phone;
    private String email;
    private BigDecimal rating;
    private String status;
    private VehicleResponseDto vehicle;
    private LocationResponseDto location;
    private Integer totalRides;
}
