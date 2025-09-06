package com.project.driverservice.repository;

import com.project.driverservice.entity.Driver;
import com.project.driverservice.enums.DriverStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {

    List<Driver> findByStatus(DriverStatus status);

    Optional<Driver> findByEmail(String email);

    Optional<Driver> findByPhone(String phone);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    @Query("SELECT d FROM Driver d WHERE d.status = 'ACTIVE'")
    List<Driver> findActiveDrivers();

    @Query("SELECT d FROM Driver d LEFT JOIN FETCH d.vehicle LEFT JOIN FETCH d.location WHERE d.id = :id")
    Optional<Driver> findByIdWithDetails(Long id);
}
