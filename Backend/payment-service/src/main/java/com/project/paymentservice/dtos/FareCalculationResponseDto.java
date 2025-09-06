package com.project.paymentservice.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FareCalculationResponseDto {
    private BigDecimal estimatedFare;
    private BigDecimal distance;
    private Integer estimatedDuration;
    private BigDecimal baseFare;
    private BigDecimal pricePerMile;
    private String rideType;
}
