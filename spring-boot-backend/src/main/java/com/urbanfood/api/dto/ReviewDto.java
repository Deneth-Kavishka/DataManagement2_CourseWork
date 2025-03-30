package com.urbanfood.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReviewDto {
    private String id;
    
    @NotNull
    private Long productId;
    
    @NotNull
    private Long userId;
    
    private String username;
    
    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;
    
    @NotBlank
    @Size(max = 1000)
    private String comment;
    
    private LocalDateTime createdAt;
}