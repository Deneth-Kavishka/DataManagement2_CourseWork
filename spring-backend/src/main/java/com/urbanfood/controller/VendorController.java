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
import com.urbanfood.model.Vendor;
import com.urbanfood.service.VendorService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/vendors")
public class VendorController {
    
    @Autowired
    private VendorService vendorService;
    
    @GetMapping
    public ResponseEntity<List<Vendor>> getAllVendors() {
        List<Vendor> vendors = vendorService.getAllVendors();
        return new ResponseEntity<>(vendors, HttpStatus.OK);
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<Vendor>> getActiveVendors() {
        List<Vendor> vendors = vendorService.getActiveVendors();
        return new ResponseEntity<>(vendors, HttpStatus.OK);
    }
    
    @GetMapping("/verified")
    public ResponseEntity<List<Vendor>> getVerifiedVendors() {
        List<Vendor> vendors = vendorService.getVerifiedVendors();
        return new ResponseEntity<>(vendors, HttpStatus.OK);
    }
    
    @GetMapping("/active-verified")
    public ResponseEntity<List<Vendor>> getActiveAndVerifiedVendors() {
        List<Vendor> vendors = vendorService.getActiveAndVerifiedVendors();
        return new ResponseEntity<>(vendors, HttpStatus.OK);
    }
    
    @GetMapping("/featured")
    public ResponseEntity<Page<Vendor>> getFeaturedVendors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Vendor> vendors = vendorService.getFeaturedVendors(pageable);
        return new ResponseEntity<>(vendors, HttpStatus.OK);
    }
    
    @GetMapping("/city/{city}")
    public ResponseEntity<List<Vendor>> getVendorsByCity(@PathVariable String city) {
        List<Vendor> vendors = vendorService.getVendorsByCity(city);
        return new ResponseEntity<>(vendors, HttpStatus.OK);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Vendor> getVendorById(@PathVariable Long id) {
        Vendor vendor = vendorService.getVendorById(id);
        return new ResponseEntity<>(vendor, HttpStatus.OK);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<Vendor> getVendorByUserId(@PathVariable Long userId) {
        Vendor vendor = vendorService.getVendorByUserId(userId);
        return new ResponseEntity<>(vendor, HttpStatus.OK);
    }
    
    @GetMapping("/business-name/{businessName}")
    public ResponseEntity<Vendor> getVendorByBusinessName(@PathVariable String businessName) {
        Vendor vendor = vendorService.getVendorByBusinessName(businessName);
        return new ResponseEntity<>(vendor, HttpStatus.OK);
    }
    
    @PostMapping
    public ResponseEntity<Vendor> createVendor(@Valid @RequestBody Vendor vendor) {
        Vendor createdVendor = vendorService.createVendor(vendor);
        return new ResponseEntity<>(createdVendor, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Vendor> updateVendor(@PathVariable Long id, @Valid @RequestBody Vendor vendor) {
        Vendor updatedVendor = vendorService.updateVendor(id, vendor);
        return new ResponseEntity<>(updatedVendor, HttpStatus.OK);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteVendor(@PathVariable Long id) {
        vendorService.deleteVendor(id);
        return new ResponseEntity<>(new MessageResponse("Vendor deleted successfully"), HttpStatus.OK);
    }
    
    @PutMapping("/{id}/verify")
    public ResponseEntity<Vendor> verifyVendor(@PathVariable Long id) {
        Vendor vendor = vendorService.verifyVendor(id);
        return new ResponseEntity<>(vendor, HttpStatus.OK);
    }
    
    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<Vendor> toggleVendorStatus(@PathVariable Long id) {
        Vendor vendor = vendorService.toggleVendorStatus(id);
        return new ResponseEntity<>(vendor, HttpStatus.OK);
    }
    
    @PutMapping("/{id}/rating")
    public ResponseEntity<Vendor> updateVendorRating(@PathVariable Long id, @RequestParam Double rating) {
        Vendor vendor = vendorService.updateVendorRating(id, rating);
        return new ResponseEntity<>(vendor, HttpStatus.OK);
    }
}