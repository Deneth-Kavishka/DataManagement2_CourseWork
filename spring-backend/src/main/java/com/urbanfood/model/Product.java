package com.urbanfood.model;

import java.math.BigDecimal;
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
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "product_seq")
    @SequenceGenerator(name = "product_seq", sequenceName = "PRODUCT_SEQ", allocationSize = 1)
    private Long id;

    @Column(length = 100, nullable = false)
    private String name;

    @Column(length = 255)
    private String description;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal price;

    @Column(name = "sale_price", precision = 10, scale = 2)
    private BigDecimal salePrice;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity;

    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable;

    @Column(name = "is_featured", nullable = false)
    private Boolean isFeatured;

    @Column(name = "is_organic", nullable = false)
    private Boolean isOrganic;

    @Column(length = 255)
    private String sku;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(length = 255)
    private String unit;

    @Column(name = "weight_value", precision = 10, scale = 2)
    private BigDecimal weightValue;

    @Column(name = "weight_unit", length = 20)
    private String weightUnit;

    @Column(name = "harvest_date")
    private LocalDateTime harvestDate;

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    @Column(name = "nutritional_info", length = 1000)
    private String nutritionalInfo;

    @Column(name = "average_rating")
    private Double averageRating;

    @Column(name = "discount_percentage")
    private Integer discountPercentage;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<OrderItem> orderItems = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        isAvailable = true;
        isFeatured = false;
        isOrganic = false;
        averageRating = 0.0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}