package com.urbanfood.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductDto {
    private Long id;
    
    @NotBlank
    @Size(max = 100)
    private String name;
    
    @Size(max = 1000)
    private String description;
    
    @DecimalMin(value = "0.0")
    private BigDecimal price;
    
    @Size(max = 255)
    private String imageUrl;
    
    private Long categoryId;
    
    private Long farmerId;
    
    private String farmName;
    
    @NotBlank
    @Size(max = 20)
    private String unit;
    
    private Boolean organic;
    
    @Min(value = 0)
    private Integer stock;
    
    private Boolean featured;
    
    private Double averageRating;
    
    private Integer reviewCount;
}