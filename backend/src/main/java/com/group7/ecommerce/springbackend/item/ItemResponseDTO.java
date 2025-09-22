package com.group7.ecommerce.springbackend.item;

import java.math.BigDecimal;

public class ItemResponseDTO {
    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private Integer quantityAvailable;
    private String imageUrl;
    private String category;
    private String sku;

    public ItemResponseDTO() {
    }

    public ItemResponseDTO(Item item) {
        this.id = item.getId();
        this.title = item.getTitle();
        this.description = item.getDescription();
        this.price = item.getPrice();
        this.quantityAvailable = item.getQuantityAvailable();
        this.imageUrl = item.getImageUrl();
        this.category = item.getCategory();
        this.sku = item.getSku();
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getQuantityAvailable() {
        return quantityAvailable;
    }

    public void setQuantityAvailable(Integer quantityAvailable) {
        this.quantityAvailable = quantityAvailable;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }
}
