package com.project.apigateway.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class GatewayConfig {
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("user-service", r -> r
                        .path("/api/users/**")
                        .uri("lb://user-service"))
                .route("ride-service", r -> r
                        .path("/api/rides/**")
                        .uri("lb://ride-service"))
                .route("driver-service", r -> r
                        .path("/api/drivers/**")
                        .uri("lb://driver-service"))
                .route("payment-service", r -> r
                        .path("/api/payments/**")
                        .uri("lb://payment-service"))
                .build();
    }
}
