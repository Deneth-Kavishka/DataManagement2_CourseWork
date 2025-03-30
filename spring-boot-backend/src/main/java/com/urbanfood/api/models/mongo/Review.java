package com.urbanfood.api.models.mongo;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "reviews")
@Data
public class Review {
    @Id
    private String id;
    
    private Long productId;
    
    private Long userId;
    
    private String username;
    
    private String content;
    
    private Integer rating;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}