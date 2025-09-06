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
public class DriverDetailsDto {
    private Long id;
    private String name;
    private String phone;
    private BigDecimal rating;
    private VehicleDetailsDto vehicle;
}
