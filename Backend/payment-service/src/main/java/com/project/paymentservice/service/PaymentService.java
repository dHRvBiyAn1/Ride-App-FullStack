package com.project.paymentservice.service;

import com.project.paymentservice.dtos.*;
import com.project.paymentservice.entity.Payment;
import com.project.paymentservice.enums.PaymentStatus;
import com.project.paymentservice.enums.RideType;
import com.project.paymentservice.exception.PaymentProcessingException;
import com.project.paymentservice.exception.ResourceNotFoundException;
import com.project.paymentservice.repository.PaymentRepository;
import com.project.paymentservice.utils.PaymentMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;

    @Transactional(readOnly = true)
    public FareCalculationResponseDto calculateFare(FareCalculationRequestDto fareRequest) {
        log.info("Calculating fare for ride from {} to {} with type: {}",
                fareRequest.getPickupLocation(), fareRequest.getDestinationLocation(), fareRequest.getRideType());

        try {
            RideType rideType = RideType.valueOf(fareRequest.getRideType().toUpperCase());

            // Simulate distance calculation (in real app, use maps API)
            BigDecimal distance = calculateDistance(fareRequest.getPickupLocation(), fareRequest.getDestinationLocation());

            // Calculate fare
            BigDecimal baseFare = rideType.getBaseFare();
            BigDecimal pricePerMile = rideType.getPricePerMile();
            BigDecimal estimatedFare = baseFare.add(distance.multiply(pricePerMile));
            estimatedFare = estimatedFare.setScale(2, RoundingMode.HALF_UP);

            // Estimate duration (assuming 3-5 minutes per mile)
            int estimatedDuration = distance.multiply(BigDecimal.valueOf(3.5)).intValue() + new Random().nextInt(10);

            FareCalculationResponseDto response = FareCalculationResponseDto.builder()
                    .estimatedFare(estimatedFare)
                    .distance(distance)
                    .estimatedDuration(estimatedDuration)
                    .baseFare(baseFare)
                    .pricePerMile(pricePerMile)
                    .rideType(fareRequest.getRideType())
                    .build();

            log.info("Fare calculated successfully: ${} for {} miles", estimatedFare, distance);

            return response;

        } catch (IllegalArgumentException e) {
            throw new PaymentProcessingException("Invalid ride type: " + fareRequest.getRideType());
        }
    }

    public PaymentResponseDto processPayment(PaymentRequestDto paymentRequest) {
        log.info("Processing payment for customer: {}, ride: {}, amount: ${}",
                paymentRequest.getCustomerId(), paymentRequest.getRideId(), paymentRequest.getAmount());

        // Check if payment already exists for this ride
        if (paymentRepository.findByRideId(paymentRequest.getRideId()).isPresent()) {
            throw new PaymentProcessingException("Payment already exists for this ride");
        }

        // Create payment record
        Payment payment = Payment.builder()
                .customerId(paymentRequest.getCustomerId())
                .rideId(paymentRequest.getRideId())
                .amount(paymentRequest.getAmount())
                .paymentMethod(paymentRequest.getPaymentMethod())
                .status(PaymentStatus.PROCESSING)
                .transactionId(generateTransactionId())
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        try {
            // Simulate payment processing
            boolean paymentSuccessful = processPaymentWithGateway(paymentRequest);

            if (paymentSuccessful) {
                savedPayment.setStatus(PaymentStatus.COMPLETED);
                savedPayment.setProcessedAt(LocalDateTime.now());
                savedPayment.setPaymentGatewayResponse("Payment processed successfully");

                paymentRepository.save(savedPayment);

                log.info("Payment processed successfully for ride: {}", paymentRequest.getRideId());

                return paymentMapper.toResponseDto(savedPayment, "Payment processed successfully");
            } else {
                savedPayment.setStatus(PaymentStatus.FAILED);
                savedPayment.setFailureReason("Payment declined by gateway");

                paymentRepository.save(savedPayment);

                throw new PaymentProcessingException("Payment was declined");
            }

        } catch (Exception e) {
            savedPayment.setStatus(PaymentStatus.FAILED);
            savedPayment.setFailureReason(e.getMessage());

            paymentRepository.save(savedPayment);

            log.error("Payment processing failed for ride: {}", paymentRequest.getRideId(), e);

            throw new PaymentProcessingException("Payment processing failed: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<PaymentDto> getPaymentsByCustomerId(Long customerId) {
        log.info("Fetching payments for customer: {}", customerId);

        List<Payment> payments = paymentRepository.findByCustomerIdOrderByCreatedDateDesc(customerId);
        return paymentMapper.toDtoList(payments);
    }

    @Transactional(readOnly = true)
    public PaymentDto getPaymentByRideId(Long rideId) {
        log.info("Fetching payment for ride: {}", rideId);

        Payment payment = paymentRepository.findByRideId(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for ride: " + rideId));

        return paymentMapper.toDto(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentDto> getAllPayments() {
        log.info("Fetching all payments");

        List<Payment> payments = paymentRepository.findAll();
        return paymentMapper.toDtoList(payments);
    }

    private BigDecimal calculateDistance(String pickupLocation, String destinationLocation) {
        // Simulate distance calculation
        // In real implementation, use Google Maps API or similar
        Random random = new Random();
        double distance = 2.0 + (random.nextDouble() * 15.0); // 2-17 miles
        return BigDecimal.valueOf(distance).setScale(2, RoundingMode.HALF_UP);
    }

    private String generateTransactionId() {
        return "TXN_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
    }

    private boolean processPaymentWithGateway(PaymentRequestDto paymentRequest) {
        // Simulate payment gateway processing
        // In real implementation, integrate with actual payment gateway like Stripe, PayPal, etc.

        try {
            // Simulate processing delay
            Thread.sleep(1000);

            // Simulate 95% success rate
            return new Random().nextInt(100) < 95;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }
}
