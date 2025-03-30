package com.urbanfood.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderItemDto {
    private Long id;
    
    @NotNull
    private Long orderId;
    
    @NotNull
    private Long productId;
    
    private String productName;
    
    @NotNull
    @Min(value = 1)
    private Integer quantity;
    
    @NotNull
    @DecimalMin(value = "0.0")
    private BigDecimal price;
    
    @NotNull
    @DecimalMin(value = "0.0")
    private BigDecimal subtotal;
}