package com.project.driverservice.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationDto {
    private Long id;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String address;
}
