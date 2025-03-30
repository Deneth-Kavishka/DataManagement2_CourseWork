package com.urbanfood.api.controllers;

import com.urbanfood.api.dto.ProductDto;
import com.urbanfood.api.models.mongo.Review;
import com.urbanfood.api.models.oracle.Product;
import com.urbanfood.api.models.oracle.User;
import com.urbanfood.api.repositories.mongo.ReviewRepository;
import com.urbanfood.api.repositories.oracle.ProductRepository;
import com.urbanfood.api.repositories.oracle.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @GetMapping
    public ResponseEntity<List<ProductDto>> getAllProducts() {
        List<Product> products = productRepository.findAll();
        List<ProductDto> productDtos = products.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(productDtos);
    }

    @GetMapping("/featured")
    public ResponseEntity<List<ProductDto>> getFeaturedProducts() {
        List<Product> products = productRepository.findByFeaturedTrue();
        List<ProductDto> productDtos = products.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(productDtos);
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductDto>> getProductsByCategory(@PathVariable Long categoryId) {
        List<Product> products = productRepository.findByCategoryId(categoryId);
        List<ProductDto> productDtos = products.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(productDtos);
    }

    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<List<ProductDto>> getProductsByFarmer(@PathVariable Long farmerId) {
        List<Product> products = productRepository.findByFarmerId(farmerId);
        List<ProductDto> productDtos = products.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(productDtos);
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductDto>> searchProducts(@RequestParam String keyword) {
        List<Product> products = productRepository.findByKeyword(keyword);
        List<ProductDto> productDtos = products.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(productDtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(this::convertToDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FARMER', 'ADMIN')")
    public ResponseEntity<ProductDto> createProduct(@Valid @RequestBody ProductDto productDto) {
        Product product = convertToEntity(productDto);

       // Verify if the farmer exists
       if (product.getFarmerId() != null) {
        Optional<User> farmerOptional = userRepository.findById(product.getFarmerId());
        if (farmerOptional.isEmpty() || !Boolean.TRUE.equals(farmerOptional.get().getIsFarmer())) {
            return ResponseEntity.badRequest().build();
        }
    }

        Product savedProduct = productRepository.save(product);

        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(savedProduct));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FARMER', 'ADMIN')")
    public ResponseEntity<ProductDto> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductDto productDto) {
        return productRepository.findById(id)
                .map(existingProduct -> {
                    existingProduct.setName(productDto.getName());
                    existingProduct.setDescription(productDto.getDescription());
                    existingProduct.setPrice(productDto.getPrice().toString());
                    existingProduct.setCategoryId(productDto.getCategoryId());
                    existingProduct.setImageUrl(productDto.getImageUrl());
                    existingProduct.setUnit(productDto.getUnit());
                    existingProduct.setOrganic(productDto.getOrganic());
                    existingProduct.setStock(productDto.getStock());
                    existingProduct.setFeatured(productDto.getFeatured());

                    Product updatedProduct = productRepository.save(existingProduct);
                    return ResponseEntity.ok(convertToDto(updatedProduct));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FARMER', 'ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(product -> {
                    productRepository.delete(product);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private ProductDto convertToDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice() != null ? new BigDecimal(product.getPrice().toString()) : null);
        dto.setImageUrl(product.getImageUrl());
        dto.setCategoryId(product.getCategoryId());
        dto.setFarmerId(product.getFarmerId());
        dto.setUnit(product.getUnit());
        dto.setOrganic(product.getOrganic());
        dto.setStock(product.getStock());
        dto.setFeatured(product.getFeatured());

        // Get farm name
        if (product.getFarmerId() != null) {
            userRepository.findById(product.getFarmerId()).ifPresent(farmer -> 
                dto.setFarmName(farmer.getFarmName())
            );
        }

        // Get average rating and review count from MongoDB
        Long reviewCount = reviewRepository.countByProductId(product.getId());
        Double averageRating = reviewRepository.getAverageRatingByProductId(product.getId());

        dto.setReviewCount(reviewCount != null ? reviewCount.intValue() : 0);
        dto.setAverageRating(averageRating);

        return dto;
    }

    private Product convertToEntity(ProductDto dto) {
        Product product = new Product();
        // Don't set ID for new products, let the database generate it
        if (dto.getId() != null) {
            product.setId(dto.getId());
        }
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice() != null ? dto.getPrice().toString() : null);
        product.setImageUrl(dto.getImageUrl());
        product.setCategoryId(dto.getCategoryId());
        product.setFarmerId(dto.getFarmerId());
        product.setUnit(dto.getUnit());
        product.setOrganic(dto.getOrganic());
        product.setStock(dto.getStock());
        product.setFeatured(dto.getFeatured());
        return product;
    }
}