package com.group7.ecommerce.springbackend.cart;

import com.group7.ecommerce.springbackend.item.Item;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cart_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    private int quantity;
    private BigDecimal priceAtAddition;
    private LocalDateTime addedAt;

    public CartItem(Cart cart, Item item, int quantity) {
        this.cart = cart;
        this.item = item;
        this.quantity = quantity;
        this.priceAtAddition = item.getPrice(); // Capture price at the time of addition
        this.addedAt = LocalDateTime.now();
    }
}
