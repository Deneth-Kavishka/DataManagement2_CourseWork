package com.urbanfood.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.urbanfood.dto.MessageResponse;
import com.urbanfood.model.Product;
import com.urbanfood.service.ProductService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    
    @Autowired
    private ProductService productService;
    
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        return new ResponseEntity<>(products, HttpStatus.OK);
    }
    
    @GetMapping("/available")
    public ResponseEntity<List<Product>> getAvailableProducts() {
        List<Product> products = productService.getAvailableProducts();
        return new ResponseEntity<>(products, HttpStatus.OK);
    }
    
    @GetMapping("/featured")
    public ResponseEntity<List<Product>> getFeaturedProducts() {
        List<Product> products = productService.getFeaturedProducts();
        return new ResponseEntity<>(products, HttpStatus.OK);
    }
    
    @GetMapping("/organic")
    public ResponseEntity<List<Product>> getOrganicProducts() {
        List<Product> products = productService.getOrganicProducts();
        return new ResponseEntity<>(products, HttpStatus.OK);
    }
    
    @GetMapping("/featured-paged")
    public ResponseEntity<Page<Product>> getFeaturedProductsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productService.getFeaturedProductsPaged(pageable);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }
    
    @GetMapping("/sale")
    public ResponseEntity<Page<Product>> getSaleProductsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productService.getSaleProductsPaged(pageable);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<Product>> searchProducts(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productService.searchProducts(query, pageable);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        return new ResponseEntity<>(product, HttpStatus.OK);
    }
    
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable Long categoryId) {
        List<Product> products = productService.getProductsByCategory(categoryId);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }
    
    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<List<Product>> getProductsByVendor(@PathVariable Long vendorId) {
        List<Product> products = productService.getProductsByVendor(vendorId);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }
    
    @GetMapping("/category/{categoryId}/organic")
    public ResponseEntity<List<Product>> getOrganicProductsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "true") Boolean isOrganic) {
        List<Product> products = productService.getOrganicProductsByCategory(categoryId, isOrganic);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }
    
    @PostMapping
    public ResponseEntity<Product> createProduct(@Valid @RequestBody Product product) {
        Product createdProduct = productService.createProduct(product);
        return new ResponseEntity<>(createdProduct, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @Valid @RequestBody Product product) {
        Product updatedProduct = productService.updateProduct(id, product);
        return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return new ResponseEntity<>(new MessageResponse("Product deleted successfully"), HttpStatus.OK);
    }
    
    @PutMapping("/{id}/toggle-availability")
    public ResponseEntity<Product> toggleProductAvailability(@PathVariable Long id) {
        Product product = productService.toggleProductAvailability(id);
        return new ResponseEntity<>(product, HttpStatus.OK);
    }
    
    @PutMapping("/{id}/toggle-featured")
    public ResponseEntity<Product> toggleProductFeatured(@PathVariable Long id) {
        Product product = productService.toggleProductFeatured(id);
        return new ResponseEntity<>(product, HttpStatus.OK);
    }
    
    @PutMapping("/{id}/rating")
    public ResponseEntity<Product> updateProductRating(@PathVariable Long id, @RequestParam Double rating) {
        Product product = productService.updateProductRating(id, rating);
        return new ResponseEntity<>(product, HttpStatus.OK);
    }
    
    @PutMapping("/{id}/stock")
    public ResponseEntity<Product> updateProductStock(@PathVariable Long id, @RequestParam Integer quantity) {
        Product product = productService.updateProductStock(id, quantity);
        return new ResponseEntity<>(product, HttpStatus.OK);
    }
}