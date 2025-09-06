package com.project.paymentservice.exception;

public class PaymentProcessingException extends RuntimeException {
    public PaymentProcessingException(String s) {
        super(s);
    }
}
