package com.project.driverservice.utils;


import com.project.driverservice.dtos.*;
import com.project.driverservice.entity.Driver;
import com.project.driverservice.entity.Location;
import com.project.driverservice.entity.Vehicle;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class DriverMapper {

    public DriverDto toDto(Driver driver) {
        if (driver == null) {
            return null;
        }

        return DriverDto.builder()
                .id(driver.getId())
                .name(driver.getName())
                .phone(driver.getPhone())
                .email(driver.getEmail())
                .rating(driver.getRating())
                .status(driver.getStatus())
                .vehicle(toVehicleDto(driver.getVehicle()))
                .location(toLocationDto(driver.getLocation()))
                .totalRides(driver.getTotalRides())
                .createdDate(driver.getCreatedDate())
                .updatedDate(driver.getUpdatedDate())
                .build();
    }

    public List<DriverDto> toDtoList(List<Driver> drivers) {
        if (drivers == null) {
            return null;
        }

        return drivers.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public VehicleDto toVehicleDto(Vehicle vehicle) {
        if (vehicle == null) {
            return null;
        }

        return VehicleDto.builder()
                .id(vehicle.getId())
                .model(vehicle.getModel())
                .plateNumber(vehicle.getPlateNumber())
                .year(vehicle.getYear())
                .color(vehicle.getColor())
                .build();
    }

    public LocationDto toLocationDto(Location location) {
        if (location == null) {
            return null;
        }

        return LocationDto.builder()
                .id(location.getId())
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .address(location.getAddress())
                .build();
    }

    public Driver toEntity(CreateDriverRequestDto dto) {
        if (dto == null) {
            return null;
        }

        Driver driver = Driver.builder()
                .name(dto.getName())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .rating(BigDecimal.valueOf(0.0))
                .totalRides(0)
                .build();

        // Create vehicle
        if (dto.getVehicle() != null) {
            Vehicle vehicle = Vehicle.builder()
                    .model(dto.getVehicle().getModel())
                    .plateNumber(dto.getVehicle().getPlateNumber())
                    .year(dto.getVehicle().getYear())
                    .color(dto.getVehicle().getColor())
                    .driver(driver)
                    .build();
            driver.setVehicle(vehicle);
        }

        // Create location
        if (dto.getLocation() != null) {
            Location location = Location.builder()
                    .latitude(dto.getLocation().getLatitude())
                    .longitude(dto.getLocation().getLongitude())
                    .address(dto.getLocation().getAddress())
                    .driver(driver)
                    .build();
            driver.setLocation(location);
        }

        return driver;
    }

    public void updateEntityFromDto(UpdateDriverRequestDto dto, Driver driver) {
        if (dto == null || driver == null) {
            return;
        }

        if (dto.getName() != null) {
            driver.setName(dto.getName());
        }
        if (dto.getPhone() != null) {
            driver.setPhone(dto.getPhone());
        }
        if (dto.getEmail() != null) {
            driver.setEmail(dto.getEmail());
        }
        if (dto.getStatus() != null) {
            driver.setStatus(dto.getStatus());
        }

        // Update vehicle if provided
        if (dto.getVehicle() != null && driver.getVehicle() != null) {
            Vehicle vehicle = driver.getVehicle();
            if (dto.getVehicle().getModel() != null) {
                vehicle.setModel(dto.getVehicle().getModel());
            }
            if (dto.getVehicle().getPlateNumber() != null) {
                vehicle.setPlateNumber(dto.getVehicle().getPlateNumber());
            }
            if (dto.getVehicle().getYear() != null) {
                vehicle.setYear(dto.getVehicle().getYear());
            }
            if (dto.getVehicle().getColor() != null) {
                vehicle.setColor(dto.getVehicle().getColor());
            }
        }

        // Update location if provided
        if (dto.getLocation() != null && driver.getLocation() != null) {
            Location location = driver.getLocation();
            if (dto.getLocation().getLatitude() != null) {
                location.setLatitude(dto.getLocation().getLatitude());
            }
            if (dto.getLocation().getLongitude() != null) {
                location.setLongitude(dto.getLocation().getLongitude());
            }
            if (dto.getLocation().getAddress() != null) {
                location.setAddress(dto.getLocation().getAddress());
            }
        }
    }
}
