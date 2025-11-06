package com.group7.ecommerce.springbackend.order;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class OrderItemDto {
    private Long itemId;
    private String itemName;
    private int quantity;
    private BigDecimal priceAtPurchase;
}

