package com.project.driverservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "vehicles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String model;

    @Column(unique = true, nullable = false, length = 20)
    private String plateNumber;

    @Column(name = "manufacture_year")
    private Integer year;

    @Column(length = 30)
    private String color;

    @OneToOne
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver;
}
