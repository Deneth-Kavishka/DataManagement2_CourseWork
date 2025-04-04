package com.urbanfood.model.mongo;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "reviews")
public class Review {

    @Id
    private String id;

    @Field("product_id")
    private Long productId;

    @Field("user_id")
    private Long userId;

    @Field("username")
    private String username;

    @Field("rating")
    private Integer rating;

    @Field("title")
    private String title;

    @Field("comment")
    private String comment;

    @Field("images")
    private String[] images;

    @Field("is_verified_purchase")
    private Boolean isVerifiedPurchase;

    @Field("helpful_votes")
    private Integer helpfulVotes;

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;
}