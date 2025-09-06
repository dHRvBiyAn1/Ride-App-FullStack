package com.project.riderservice.service;

import com.project.riderservice.dtos.FareCalculationRequestDto;
import com.project.riderservice.dtos.FareCalculationResponseDto;
import com.project.riderservice.dtos.PaymentRequestDto;
import com.project.riderservice.dtos.PaymentResponseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "payment-service", path = "/api/payments")
public interface PaymentServiceClient {

    @PostMapping("/calculate-fare")
    ResponseEntity<FareCalculationResponseDto> calculateFare(@RequestBody FareCalculationRequestDto fareRequest);

    @PostMapping("/process")
    ResponseEntity<PaymentResponseDto> processPayment(@RequestBody PaymentRequestDto paymentRequest);
}
