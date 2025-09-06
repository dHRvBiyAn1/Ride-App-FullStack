package com.project.riderservice.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponseDto {
    private Long id;
    private String model;
    private String plateNumber;
    private Integer year;
    private String color;
}
