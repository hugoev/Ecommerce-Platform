package com.group7.ecommerce.springbackend.cart;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CartDto {
    private List<CartItemDto> items;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal discountAmount;
    private String appliedDiscountCode;
    private BigDecimal total;
}
