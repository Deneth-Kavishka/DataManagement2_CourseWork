package com.urbanfood.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.urbanfood.model.User;
import com.urbanfood.model.Vendor;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {
    
    Optional<Vendor> findByUser(User user);
    
    Optional<Vendor> findByBusinessName(String businessName);
    
    List<Vendor> findByIsActive(Boolean isActive);
    
    List<Vendor> findByIsVerified(Boolean isVerified);
    
    List<Vendor> findByIsActiveAndIsVerified(Boolean isActive, Boolean isVerified);
    
    @Query("SELECT v FROM Vendor v WHERE v.isActive = true AND v.isVerified = true ORDER BY v.averageRating DESC")
    Page<Vendor> findFeaturedVendors(Pageable pageable);
    
    @Query("SELECT v FROM Vendor v WHERE v.isActive = true AND v.city = ?1")
    List<Vendor> findByCity(String city);
    
    boolean existsByBusinessName(String businessName);
    
    boolean existsByBusinessEmail(String businessEmail);
}