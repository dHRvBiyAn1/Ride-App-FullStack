package com.project.driverservice.entity;

import com.project.driverservice.enums.DriverStatus;
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
@Table(name = "drivers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(unique = true, nullable = false, length = 20)
    private String phone;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal rating = BigDecimal.valueOf(0.0);

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DriverStatus status = DriverStatus.ACTIVE;

    @OneToOne(mappedBy = "driver", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Vehicle vehicle;

    @OneToOne(mappedBy = "driver", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Location location;

    @Column(name = "total_rides")
    @Builder.Default
    private Integer totalRides = 0;

    @CreationTimestamp
    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate;

    @UpdateTimestamp
    @Column(name = "updated_date")
    private LocalDateTime updatedDate;
}
