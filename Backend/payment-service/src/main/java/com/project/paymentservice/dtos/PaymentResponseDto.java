package com.project.paymentservice.dtos;

import com.project.paymentservice.enums.PaymentMethod;
import com.project.paymentservice.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponseDto {
    private Long paymentId;
    private Long customerId;
    private Long rideId;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private PaymentStatus status;
    private String transactionId;
    private String message;
    private LocalDateTime processedAt;
    private LocalDateTime createdDate;
}
