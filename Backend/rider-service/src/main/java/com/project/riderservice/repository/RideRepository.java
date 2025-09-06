package com.project.riderservice.repository;

import com.project.riderservice.entity.Ride;
import com.project.riderservice.enums.RideStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long> {

    List<Ride> findByCustomerIdOrderByCreatedDateDesc(Long customerId);

    List<Ride> findByDriverIdOrderByCreatedDateDesc(Long driverId);

    List<Ride> findByStatus(RideStatus status);

    @Query("SELECT r FROM Ride r WHERE r.customerId = :customerId AND r.status = :status ORDER BY r.createdDate DESC")
    List<Ride> findByCustomerIdAndStatus(@Param("customerId") Long customerId, @Param("status") RideStatus status);

    @Query("SELECT r FROM Ride r WHERE r.driverId = :driverId AND r.status = :status ORDER BY r.createdDate DESC")
    List<Ride> findByDriverIdAndStatus(@Param("driverId") Long driverId, @Param("status") RideStatus status);

    @Query("SELECT COUNT(r) FROM Ride r WHERE r.customerId = :customerId")
    Long countByCustomerId(@Param("customerId") Long customerId);

    @Query("SELECT COUNT(r) FROM Ride r WHERE r.driverId = :driverId")
    Long countByDriverId(@Param("driverId") Long driverId);
}
