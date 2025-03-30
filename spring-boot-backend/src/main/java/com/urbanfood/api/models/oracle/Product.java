package com.urbanfood.api.models.oracle;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private String price;
    private String imageUrl;
    private Long categoryId;
    private Long farmerId;
    private String unit;
    private Boolean organic;
    private Integer stock;
    private Boolean featured;
}