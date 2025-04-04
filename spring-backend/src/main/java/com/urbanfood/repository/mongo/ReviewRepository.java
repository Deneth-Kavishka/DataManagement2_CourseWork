package com.urbanfood.repository.mongo;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.urbanfood.model.mongo.Review;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {
    
    List<Review> findByProductId(Long productId);
    
    List<Review> findByUserId(Long userId);
    
    @Query("{ 'productId': ?0 }")
    Page<Review> findPagedByProductId(Long productId, Pageable pageable);
    
    @Query("{ 'userId': ?0 }")
    Page<Review> findPagedByUserId(Long userId, Pageable pageable);
    
    @Query("{ 'productId': ?0, 'rating': ?1 }")
    List<Review> findByProductIdAndRating(Long productId, Integer rating);
    
    @Query("{ 'productId': ?0, 'isVerifiedPurchase': true }")
    List<Review> findVerifiedReviewsByProductId(Long productId);
    
    @Query("{ 'productId': ?0 }")
    long countByProductId(Long productId);
    
    @Query("{ 'productId': ?0 }")
    double averageRatingByProductId(Long productId);
}