package com.urbanfood.model;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "vendors")
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "vendor_seq")
    @SequenceGenerator(name = "vendor_seq", sequenceName = "VENDOR_SEQ", allocationSize = 1)
    private Long id;

    @Column(name = "business_name", length = 100, nullable = false)
    private String businessName;

    @Column(length = 255)
    private String description;

    @Column(length = 255)
    private String logoUrl;

    @Column(length = 255)
    private String bannerUrl;

    @Column(name = "business_address", length = 255)
    private String businessAddress;

    @Column(length = 50)
    private String city;

    @Column(length = 50)
    private String state;

    @Column(name = "zip_code", length = 10)
    private String zipCode;

    @Column(length = 50)
    private String country;

    @Column(name = "business_phone", length = 15)
    private String businessPhone;

    @Column(name = "business_email", length = 100)
    private String businessEmail;

    @Column(name = "website_url", length = 255)
    private String websiteUrl;

    @Column(name = "business_hours", length = 255)
    private String businessHours;

    @Column(length = 255)
    private String specialties;

    @Column(name = "founding_year")
    private Integer foundingYear;

    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "average_rating")
    private Double averageRating;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "vendor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Product> products = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        isActive = true;
        isVerified = false;
        averageRating = 0.0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}