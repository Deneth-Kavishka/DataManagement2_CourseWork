package com.urbanfood.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.urbanfood.exception.ResourceNotFoundException;
import com.urbanfood.model.Product;
import com.urbanfood.model.User;
import com.urbanfood.model.mongo.Review;
import com.urbanfood.repository.ProductRepository;
import com.urbanfood.repository.UserRepository;
import com.urbanfood.repository.mongo.ReviewRepository;

@Service
public class ReviewService {
    
    @Autowired
    private ReviewRepository reviewRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private ProductService productService;
    
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }
    
    public Review getReviewById(String id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));
    }
    
    public List<Review> getReviewsByProduct(Long productId) {
        // Verify product exists
        productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        
        return reviewRepository.findByProductId(productId);
    }
    
    public Page<Review> getReviewsByProductPaged(Long productId, Pageable pageable) {
        // Verify product exists
        productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        
        return reviewRepository.findPagedByProductId(productId, pageable);
    }
    
    public List<Review> getReviewsByUser(Long userId) {
        // Verify user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        return reviewRepository.findByUserId(userId);
    }
    
    public Page<Review> getReviewsByUserPaged(Long userId, Pageable pageable) {
        // Verify user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        return reviewRepository.findPagedByUserId(userId, pageable);
    }
    
    public List<Review> getVerifiedReviewsByProduct(Long productId) {
        // Verify product exists
        productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        
        return reviewRepository.findVerifiedReviewsByProductId(productId);
    }
    
    public List<Review> getReviewsByProductAndRating(Long productId, Integer rating) {
        // Verify product exists
        productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        
        return reviewRepository.findByProductIdAndRating(productId, rating);
    }
    
    public Review createReview(Review review) {
        // Verify user exists
        User user = userRepository.findById(review.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + review.getUserId()));
        
        // Verify product exists
        Product product = productRepository.findById(review.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + review.getProductId()));
        
        // Set review details
        review.setUserName(user.getFirstName() + " " + user.getLastName());
        
        if (review.getCreatedAt() == null) {
            review.setCreatedAt(LocalDateTime.now());
        }
        
        // Save the review
        Review savedReview = reviewRepository.save(review);
        
        // Update product rating
        updateProductAverageRating(product.getId());
        
        return savedReview;
    }
    
    public Review updateReview(String id, Review reviewUpdate) {
        Review review = getReviewById(id);
        
        // Update fields
        if (reviewUpdate.getTitle() != null) {
            review.setTitle(reviewUpdate.getTitle());
        }
        
        if (reviewUpdate.getContent() != null) {
            review.setContent(reviewUpdate.getContent());
        }
        
        if (reviewUpdate.getRating() != null) {
            review.setRating(reviewUpdate.getRating());
        }
        
        if (reviewUpdate.getPros() != null) {
            review.setPros(reviewUpdate.getPros());
        }
        
        if (reviewUpdate.getCons() != null) {
            review.setCons(reviewUpdate.getCons());
        }
        
        if (reviewUpdate.getImages() != null) {
            review.setImages(reviewUpdate.getImages());
        }
        
        // Save the updated review
        Review updatedReview = reviewRepository.save(review);
        
        // Update product rating
        updateProductAverageRating(review.getProductId());
        
        return updatedReview;
    }
    
    public void deleteReview(String id) {
        Review review = getReviewById(id);
        Long productId = review.getProductId();
        
        // Delete the review
        reviewRepository.deleteById(id);
        
        // Update product rating
        updateProductAverageRating(productId);
    }
    
    private void updateProductAverageRating(Long productId) {
        // Calculate average rating
        double averageRating = 0.0;
        long totalReviews = reviewRepository.countByProductId(productId);
        
        if (totalReviews > 0) {
            averageRating = reviewRepository.averageRatingByProductId(productId);
        }
        
        // Update product's average rating
        productService.updateProductRating(productId, averageRating);
    }
}