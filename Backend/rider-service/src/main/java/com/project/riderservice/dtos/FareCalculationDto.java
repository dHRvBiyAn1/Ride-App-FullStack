package com.project.riderservice.dtos;

import com.project.riderservice.enums.RideType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FareCalculationDto {
    private BigDecimal estimatedFare;
    private BigDecimal distance;
    private Integer estimatedDuration;
    private BigDecimal baseFare;
    private BigDecimal pricePerMile;
    private RideType rideType;
}
