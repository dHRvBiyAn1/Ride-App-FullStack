package com.project.paymentservice.utils;

import com.project.paymentservice.dtos.PaymentDto;
import com.project.paymentservice.dtos.PaymentResponseDto;
import com.project.paymentservice.entity.Payment;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class PaymentMapper {

    public PaymentDto toDto(Payment payment) {
        if (payment == null) {
            return null;
        }

        return PaymentDto.builder()
                .id(payment.getId())
                .customerId(payment.getCustomerId())
                .rideId(payment.getRideId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .transactionId(payment.getTransactionId())
                .failureReason(payment.getFailureReason())
                .processedAt(payment.getProcessedAt())
                .createdDate(payment.getCreatedDate())
                .updatedDate(payment.getUpdatedDate())
                .build();
    }

    public List<PaymentDto> toDtoList(List<Payment> payments) {
        if (payments == null) {
            return null;
        }

        return payments.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public PaymentResponseDto toResponseDto(Payment payment, String message) {
        if (payment == null) {
            return null;
        }

        return PaymentResponseDto.builder()
                .paymentId(payment.getId())
                .customerId(payment.getCustomerId())
                .rideId(payment.getRideId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .transactionId(payment.getTransactionId())
                .message(message)
                .processedAt(payment.getProcessedAt())
                .createdDate(payment.getCreatedDate())
                .build();
    }
}
