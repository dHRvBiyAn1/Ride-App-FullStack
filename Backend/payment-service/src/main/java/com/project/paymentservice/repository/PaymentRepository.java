package com.project.paymentservice.repository;

import com.project.paymentservice.entity.Payment;
import com.project.paymentservice.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByCustomerIdOrderByCreatedDateDesc(Long customerId);

    Optional<Payment> findByRideId(Long rideId);

    List<Payment> findByStatus(PaymentStatus status);

    Optional<Payment> findByTransactionId(String transactionId);

    @Query("SELECT p FROM Payment p WHERE p.customerId = :customerId AND p.status = :status ORDER BY p.createdDate DESC")
    List<Payment> findByCustomerIdAndStatus(@Param("customerId") Long customerId, @Param("status") PaymentStatus status);

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.customerId = :customerId AND p.status = 'COMPLETED'")
    Long countCompletedPaymentsByCustomer(@Param("customerId") Long customerId);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.customerId = :customerId AND p.status = 'COMPLETED'")
    java.math.BigDecimal getTotalAmountByCustomer(@Param("customerId") Long customerId);
}
