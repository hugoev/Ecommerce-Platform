package com.group7.ecommerce.springbackend.item;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ItemRequestDTOs {

    public static class CreateItemRequest {
        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title must not exceed 255 characters")
        private String title;

        @Size(max = 2000, message = "Description must not exceed 2000 characters")
        private String description;

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.00", message = "Price must be greater than or equal to 0.00")
        private BigDecimal price;

        @NotNull(message = "Quantity available is required")
        @Min(value = 0, message = "Quantity available must be greater than or equal to 0")
        private Integer quantityAvailable;

        @Size(max = 1000, message = "Image URL must not exceed 1000 characters")
        private String imageUrl;

        @NotBlank(message = "Category is required")
        @Size(max = 50, message = "Category must not exceed 50 characters")
        private String category;

        @Size(max = 100, message = "SKU must not exceed 100 characters")
        private String sku;

        public CreateItemRequest() {
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

    public static class UpdateItemRequest {
        @Size(max = 255, message = "Title must not exceed 255 characters")
        private String title;

        @Size(max = 2000, message = "Description must not exceed 2000 characters")
        private String description;

        @DecimalMin(value = "0.00", message = "Price must be greater than or equal to 0.00")
        private BigDecimal price;

        @Min(value = 0, message = "Quantity available must be greater than or equal to 0")
        private Integer quantityAvailable;

        @Size(max = 1000, message = "Image URL must not exceed 1000 characters")
        private String imageUrl;

        @Size(max = 50, message = "Category must not exceed 50 characters")
        private String category;

        @Size(max = 100, message = "SKU must not exceed 100 characters")
        private String sku;

        public UpdateItemRequest() {
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
}
