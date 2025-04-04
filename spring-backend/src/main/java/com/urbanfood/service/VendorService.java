package com.urbanfood.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.urbanfood.exception.ResourceAlreadyExistsException;
import com.urbanfood.exception.ResourceNotFoundException;
import com.urbanfood.model.User;
import com.urbanfood.model.Vendor;
import com.urbanfood.repository.UserRepository;
import com.urbanfood.repository.VendorRepository;

@Service
@Transactional
public class VendorService {
    
    @Autowired
    private VendorRepository vendorRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public List<Vendor> getAllVendors() {
        return vendorRepository.findAll();
    }
    
    public List<Vendor> getActiveVendors() {
        return vendorRepository.findByIsActive(true);
    }
    
    public List<Vendor> getVerifiedVendors() {
        return vendorRepository.findByIsVerified(true);
    }
    
    public List<Vendor> getActiveAndVerifiedVendors() {
        return vendorRepository.findByIsActiveAndIsVerified(true, true);
    }
    
    public Page<Vendor> getFeaturedVendors(Pageable pageable) {
        return vendorRepository.findFeaturedVendors(pageable);
    }
    
    public List<Vendor> getVendorsByCity(String city) {
        return vendorRepository.findByCity(city);
    }
    
    public Vendor getVendorById(Long id) {
        return vendorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with id: " + id));
    }
    
    public Vendor getVendorByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        return vendorRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found for user with id: " + userId));
    }
    
    public Vendor getVendorByBusinessName(String businessName) {
        return vendorRepository.findByBusinessName(businessName)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with business name: " + businessName));
    }
    
    public Vendor createVendor(Vendor vendor) {
        if (vendorRepository.existsByBusinessName(vendor.getBusinessName())) {
            throw new ResourceAlreadyExistsException("Vendor already exists with business name: " + vendor.getBusinessName());
        }
        
        if (vendorRepository.existsByBusinessEmail(vendor.getBusinessEmail())) {
            throw new ResourceAlreadyExistsException("Vendor already exists with business email: " + vendor.getBusinessEmail());
        }
        
        // Verify user exists
        User user = userRepository.findById(vendor.getUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + vendor.getUser().getId()));
        
        // Check if user already has a vendor profile
        if (vendorRepository.findByUser(user).isPresent()) {
            throw new ResourceAlreadyExistsException("User already has a vendor profile");
        }
        
        // Set defaults if not provided
        if (vendor.getIsActive() == null) {
            vendor.setIsActive(true);
        }
        
        if (vendor.getIsVerified() == null) {
            vendor.setIsVerified(false); // New vendors must be verified by admin
        }
        
        if (vendor.getAverageRating() == null) {
            vendor.setAverageRating(0.0);
        }
        
        return vendorRepository.save(vendor);
    }
    
    public Vendor updateVendor(Long id, Vendor vendorDetails) {
        Vendor vendor = getVendorById(id);
        
        // Check if business name is being changed and if it already exists
        if (!vendor.getBusinessName().equals(vendorDetails.getBusinessName()) &&
            vendorRepository.existsByBusinessName(vendorDetails.getBusinessName())) {
            throw new ResourceAlreadyExistsException("Vendor already exists with business name: " + vendorDetails.getBusinessName());
        }
        
        // Check if business email is being changed and if it already exists
        if (!vendor.getBusinessEmail().equals(vendorDetails.getBusinessEmail()) &&
            vendorRepository.existsByBusinessEmail(vendorDetails.getBusinessEmail())) {
            throw new ResourceAlreadyExistsException("Vendor already exists with business email: " + vendorDetails.getBusinessEmail());
        }
        
        // Update vendor details (except user association)
        vendor.setBusinessName(vendorDetails.getBusinessName());
        vendor.setBusinessDescription(vendorDetails.getBusinessDescription());
        vendor.setBusinessEmail(vendorDetails.getBusinessEmail());
        vendor.setBusinessPhone(vendorDetails.getBusinessPhone());
        vendor.setLogoUrl(vendorDetails.getLogoUrl());
        vendor.setCoverImageUrl(vendorDetails.getCoverImageUrl());
        vendor.setAddress(vendorDetails.getAddress());
        vendor.setCity(vendorDetails.getCity());
        vendor.setState(vendorDetails.getState());
        vendor.setZipCode(vendorDetails.getZipCode());
        vendor.setLatitude(vendorDetails.getLatitude());
        vendor.setLongitude(vendorDetails.getLongitude());
        vendor.setBusinessHours(vendorDetails.getBusinessHours());
        vendor.setIsActive(vendorDetails.getIsActive());
        vendor.setIsVerified(vendorDetails.getIsVerified());
        
        return vendorRepository.save(vendor);
    }
    
    public void deleteVendor(Long id) {
        Vendor vendor = getVendorById(id);
        vendorRepository.delete(vendor);
    }
    
    public Vendor verifyVendor(Long id) {
        Vendor vendor = getVendorById(id);
        vendor.setIsVerified(true);
        return vendorRepository.save(vendor);
    }
    
    public Vendor toggleVendorStatus(Long id) {
        Vendor vendor = getVendorById(id);
        vendor.setIsActive(!vendor.getIsActive());
        return vendorRepository.save(vendor);
    }
    
    public Vendor updateVendorRating(Long id, Double newRating) {
        Vendor vendor = getVendorById(id);
        vendor.setAverageRating(newRating);
        return vendorRepository.save(vendor);
    }
}