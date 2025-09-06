package com.project.paymentservice.controller;

import com.project.paymentservice.dtos.*;
import com.project.paymentservice.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/calculate-fare")
    public ResponseEntity<FareCalculationResponseDto> calculateFare(@Valid @RequestBody FareCalculationRequestDto fareRequest) {
        log.info("Calculate fare request received for route: {} to {}",
                fareRequest.getPickupLocation(), fareRequest.getDestinationLocation());

        FareCalculationResponseDto response = paymentService.calculateFare(fareRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/process")
    public ResponseEntity<PaymentResponseDto> processPayment(@Valid @RequestBody PaymentRequestDto paymentRequest) {
        log.info("Process payment request received for customer: {}, ride: {}",
                paymentRequest.getCustomerId(), paymentRequest.getRideId());

        PaymentResponseDto response = paymentService.processPayment(paymentRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<PaymentDto>> getPaymentsByCustomerId(@PathVariable Long customerId) {
        log.info("Get payments request received for customer: {}", customerId);

        List<PaymentDto> payments = paymentService.getPaymentsByCustomerId(customerId);
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/ride/{rideId}")
    public ResponseEntity<PaymentDto> getPaymentByRideId(@PathVariable Long rideId) {
        log.info("Get payment request received for ride: {}", rideId);

        PaymentDto payment = paymentService.getPaymentByRideId(rideId);
        return ResponseEntity.ok(payment);
    }

    @GetMapping
    public ResponseEntity<List<PaymentDto>> getAllPayments() {
        log.info("Get all payments request received");

        List<PaymentDto> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(payments);
    }
}
