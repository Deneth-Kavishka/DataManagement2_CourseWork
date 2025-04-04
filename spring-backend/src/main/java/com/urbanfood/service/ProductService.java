package com.urbanfood.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.urbanfood.exception.ResourceAlreadyExistsException;
import com.urbanfood.exception.ResourceNotFoundException;
import com.urbanfood.model.Category;
import com.urbanfood.model.Product;
import com.urbanfood.model.Vendor;
import com.urbanfood.repository.CategoryRepository;
import com.urbanfood.repository.ProductRepository;
import com.urbanfood.repository.VendorRepository;

@Service
@Transactional
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private VendorRepository vendorRepository;
    
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    public List<Product> getAvailableProducts() {
        return productRepository.findByIsAvailable(true);
    }
    
    public List<Product> getFeaturedProducts() {
        return productRepository.findByIsFeatured(true);
    }
    
    public List<Product> getOrganicProducts() {
        return productRepository.findByIsOrganic(true);
    }
    
    public Page<Product> getFeaturedProductsPaged(Pageable pageable) {
        return productRepository.findFeaturedProducts(pageable);
    }
    
    public Page<Product> getSaleProductsPaged(Pageable pageable) {
        return productRepository.findSaleProducts(pageable);
    }
    
    public Page<Product> searchProducts(String searchTerm, Pageable pageable) {
        return productRepository.searchProducts(searchTerm, pageable);
    }
    
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }
    
    public List<Product> getProductsByCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
        
        return productRepository.findByCategory(category);
    }
    
    public List<Product> getProductsByVendor(Long vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with id: " + vendorId));
        
        return productRepository.findByVendor(vendor);
    }
    
    public List<Product> getOrganicProductsByCategory(Long categoryId, Boolean isOrganic) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
        
        return productRepository.findByCategoryAndIsOrganic(category, isOrganic);
    }
    
    public Product createProduct(Product product) {
        if (productRepository.existsBySku(product.getSku())) {
            throw new ResourceAlreadyExistsException("Product already exists with SKU: " + product.getSku());
        }
        
        // Verify category exists
        Category category = categoryRepository.findById(product.getCategory().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + product.getCategory().getId()));
        product.setCategory(category);
        
        // Verify vendor exists
        Vendor vendor = vendorRepository.findById(product.getVendor().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with id: " + product.getVendor().getId()));
        product.setVendor(vendor);
        
        // Set defaults if not provided
        if (product.getIsAvailable() == null) {
            product.setIsAvailable(true);
        }
        
        if (product.getIsFeatured() == null) {
            product.setIsFeatured(false);
        }
        
        if (product.getIsOrganic() == null) {
            product.setIsOrganic(false);
        }
        
        if (product.getAverageRating() == null) {
            product.setAverageRating(0.0);
        }
        
        return productRepository.save(product);
    }
    
    public Product updateProduct(Long id, Product productDetails) {
        Product product = getProductById(id);
        
        // Check if SKU is being changed and if it already exists
        if (!product.getSku().equals(productDetails.getSku()) &&
            productRepository.existsBySku(productDetails.getSku())) {
            throw new ResourceAlreadyExistsException("Product already exists with SKU: " + productDetails.getSku());
        }
        
        // Verify category exists if changed
        if (productDetails.getCategory() != null && productDetails.getCategory().getId() != null &&
            !product.getCategory().getId().equals(productDetails.getCategory().getId())) {
            Category category = categoryRepository.findById(productDetails.getCategory().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + productDetails.getCategory().getId()));
            product.setCategory(category);
        }
        
        // Update product details
        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setSku(productDetails.getSku());
        product.setPrice(productDetails.getPrice());
        product.setSalePrice(productDetails.getSalePrice());
        product.setQuantityInStock(productDetails.getQuantityInStock());
        product.setUnit(productDetails.getUnit());
        product.setImageUrl(productDetails.getImageUrl());
        product.setAdditionalImages(productDetails.getAdditionalImages());
        product.setIsAvailable(productDetails.getIsAvailable());
        product.setIsFeatured(productDetails.getIsFeatured());
        product.setIsOrganic(productDetails.getIsOrganic());
        product.setAttributes(productDetails.getAttributes());
        
        return productRepository.save(product);
    }
    
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }
    
    public Product toggleProductAvailability(Long id) {
        Product product = getProductById(id);
        product.setIsAvailable(!product.getIsAvailable());
        return productRepository.save(product);
    }
    
    public Product toggleProductFeatured(Long id) {
        Product product = getProductById(id);
        product.setIsFeatured(!product.getIsFeatured());
        return productRepository.save(product);
    }
    
    public Product updateProductRating(Long id, Double newRating) {
        Product product = getProductById(id);
        product.setAverageRating(newRating);
        return productRepository.save(product);
    }
    
    public Product updateProductStock(Long id, Integer quantityChange) {
        Product product = getProductById(id);
        int newQuantity = product.getQuantityInStock() + quantityChange;
        product.setQuantityInStock(Math.max(0, newQuantity)); // Ensure quantity doesn't go below 0
        
        // If stock is depleted, set product as unavailable
        if (product.getQuantityInStock() == 0) {
            product.setIsAvailable(false);
        }
        
        return productRepository.save(product);
    }
}