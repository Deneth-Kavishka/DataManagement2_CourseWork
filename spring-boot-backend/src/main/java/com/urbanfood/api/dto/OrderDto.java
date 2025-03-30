package com.urbanfood.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderDto {
    private Long id;
    
    @NotBlank
    @Size(max = 20)
    private String status;
    
    @NotNull
    private Long userId;
    
    private LocalDateTime orderDate;
    
    @NotNull
    @DecimalMin(value = "0.0")
    private BigDecimal totalAmount;
    
    @NotBlank
    @Size(max = 255)
    private String shippingAddress;
    
    @Size(max = 20)
    private String contactPhone;
    
    @NotBlank
    @Size(max = 50)
    private String paymentMethod;
    
    private List<OrderItemDto> orderItems;
}