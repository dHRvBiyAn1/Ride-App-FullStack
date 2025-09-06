package com.project.riderservice.dtos;

import com.project.riderservice.enums.RideType;
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
public class CreateRideRequestDto {
    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotBlank(message = "Pickup location is required")
    @Size(max = 255, message = "Pickup location must not exceed 255 characters")
    private String pickupLocation;

    @NotBlank(message = "Destination location is required")
    @Size(max = 255, message = "Destination location must not exceed 255 characters")
    private String destinationLocation;

    @NotNull(message = "Ride type is required")
    private RideType rideType;
}
