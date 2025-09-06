package com.project.driverservice.dtos;

import com.project.driverservice.enums.DriverStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDriverRequestDto {
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;

    @Email(message = "Email should be valid")
    private String email;

    private DriverStatus status;

    @Valid
    private CreateVehicleRequestDto vehicle;

    @Valid
    private CreateLocationRequestDto location;
}
