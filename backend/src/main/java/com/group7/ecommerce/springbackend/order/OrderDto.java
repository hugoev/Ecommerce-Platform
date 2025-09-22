package com.group7.ecommerce.springbackend.order;

import com.group7.ecommerce.springbackend.item.ItemDto;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Data
public class OrderDto {
    private Long id;
    private Long userId;
    private String userUsername;
    private List<OrderItemDto> orderItems;
    private String status;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal discountAmount;
    private BigDecimal total;
    private String appliedDiscountCode;
    private OffsetDateTime orderDate;
}

@Data
class OrderItemDto {
    private Long itemId;
    private String itemName;
    private int quantity;
    private BigDecimal priceAtPurchase;
}
