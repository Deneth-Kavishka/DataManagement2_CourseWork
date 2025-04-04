package com.urbanfood.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.urbanfood.model.Category;
import com.urbanfood.model.Product;
import com.urbanfood.model.Vendor;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    List<Product> findByCategory(Category category);
    
    List<Product> findByVendor(Vendor vendor);
    
    List<Product> findByIsAvailable(Boolean isAvailable);
    
    List<Product> findByIsFeatured(Boolean isFeatured);
    
    List<Product> findByIsOrganic(Boolean isOrganic);
    
    @Query("SELECT p FROM Product p WHERE p.isAvailable = true AND p.isFeatured = true ORDER BY p.averageRating DESC")
    Page<Product> findFeaturedProducts(Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.isAvailable = true AND p.salePrice IS NOT NULL AND p.salePrice < p.price ORDER BY (p.price - p.salePrice) / p.price DESC")
    Page<Product> findSaleProducts(Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.isAvailable = true AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Product> searchProducts(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.isAvailable = true AND p.category = :category AND p.isOrganic = :isOrganic")
    List<Product> findByCategoryAndIsOrganic(@Param("category") Category category, @Param("isOrganic") Boolean isOrganic);
    
    boolean existsBySku(String sku);
}