package com.project.driverservice.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleDto {
    private Long id;
    private String model;
    private String plateNumber;
    private Integer year;
    private String color;
}
