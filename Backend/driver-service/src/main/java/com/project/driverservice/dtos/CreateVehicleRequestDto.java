package com.project.driverservice.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateVehicleRequestDto {
    @NotBlank(message = "Model is required")
    @Size(max = 50, message = "Model must not exceed 50 characters")
    private String model;

    @NotBlank(message = "Plate number is required")
    @Size(max = 20, message = "Plate number must not exceed 20 characters")
    private String plateNumber;

    @NotNull(message = "Year is required")
    private Integer year;

    @Size(max = 30, message = "Color must not exceed 30 characters")
    private String color;
}
