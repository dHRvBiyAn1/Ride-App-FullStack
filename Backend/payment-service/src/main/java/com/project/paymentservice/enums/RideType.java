package com.project.paymentservice.enums;

import java.math.BigDecimal;

public enum RideType {
    ECONOMY("Economy", new BigDecimal("1.5"), new BigDecimal("2.5")),
    PREMIUM("Premium", new BigDecimal("2.0"), new BigDecimal("3.5")),
    LUXURY("Luxury", new BigDecimal("3.0"), new BigDecimal("5.0"));

    private final String displayName;
    private final BigDecimal pricePerMile;
    private final BigDecimal baseFare;

    RideType(String displayName, BigDecimal pricePerMile, BigDecimal baseFare) {
        this.displayName = displayName;
        this.pricePerMile = pricePerMile;
        this.baseFare = baseFare;
    }

    public String getDisplayName() {
        return displayName;
    }

    public BigDecimal getPricePerMile() {
        return pricePerMile;
    }

    public BigDecimal getBaseFare() {
        return baseFare;
    }
}
