package com.group7.ecommerce.springbackend.item;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ItemDto {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private int quantityAvailable;
    private String imageUrl;
    private boolean isOnSale;
    private BigDecimal discountedPrice;
}
