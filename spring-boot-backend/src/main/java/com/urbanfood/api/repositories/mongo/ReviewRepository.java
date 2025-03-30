package com.urbanfood.api.repositories.mongo;

import com.urbanfood.api.models.mongo.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByProductId(Long productId);
    
    List<Review> findByUserId(Long userId);
    
    @Query("{ 'productId' : ?0, 'rating' : { $gte : ?1 } }")
    List<Review> findByProductIdAndMinRating(Long productId, Integer minRating);
    
    Long countByProductId(Long productId);
    
    @Query("{ 'productId' : ?0 }")
    Double getAverageRatingByProductId(Long productId);
}