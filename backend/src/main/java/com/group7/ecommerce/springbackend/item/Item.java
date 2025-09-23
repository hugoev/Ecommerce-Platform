package com.group7.ecommerce.springbackend.item;

import java.math.BigDecimal;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private BigDecimal price;
    private int quantityAvailable;
    private String imageUrl;
    private String category;
    private String sku;
    private boolean isOnSale;
    private BigDecimal discountedPrice;

    public Item(String title, String description, BigDecimal price, Integer quantityAvailable, String imageUrl,
            String category, String sku) {
        this.title = title;
        this.description = description;
        this.price = price;
        this.quantityAvailable = quantityAvailable;
        this.imageUrl = imageUrl;
        this.category = category;
        this.sku = sku;
        this.isOnSale = false;
    }
}