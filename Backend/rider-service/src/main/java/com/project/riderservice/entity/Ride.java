package com.project.riderservice.entity;

import com.project.riderservice.enums.RideStatus;
import com.project.riderservice.enums.RideType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "rides")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ride {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "driver_id")
    private Long driverId;

    @Column(name = "customer_name", length = 100)
    private String customerName;

    @Column(name = "driver_name", length = 100)
    private String driverName;

    @Column(name = "pickup_location", nullable = false, length = 255)
    private String pickupLocation;

    @Column(name = "destination_location", nullable = false, length = 255)
    private String destinationLocation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RideStatus status = RideStatus.REQUESTED;

    @Enumerated(EnumType.STRING)
    @Column(name = "ride_type", nullable = false)
    private RideType rideType;

    @Column(precision = 10, scale = 2)
    private BigDecimal estimatedFare;

    @Column(precision = 10, scale = 2)
    private BigDecimal actualFare;

    @Column(precision = 8, scale = 2)
    private BigDecimal distance;

    @Column(name = "estimated_duration")
    private Integer estimatedDuration;

    @Column(name = "actual_duration")
    private Integer actualDuration;

    @Column(name = "driver_rating")
    private Integer driverRating;

    @Column(name = "customer_rating")
    private Integer customerRating;

    @Column(name = "pickup_time")
    private LocalDateTime pickupTime;

    @Column(name = "completion_time")
    private LocalDateTime completionTime;

    @CreationTimestamp
    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate;

    @UpdateTimestamp
    @Column(name = "updated_date")
    private LocalDateTime updatedDate;
}
