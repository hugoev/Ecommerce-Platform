package com.group7.ecommerce.springbackend.cart;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.group7.ecommerce.springbackend.item.Item;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCart(Cart cart);

    Optional<CartItem> findByCartAndItem(Cart cart, Item item);

    void deleteByCart(Cart cart);

    void deleteByCartAndItem(Cart cart, Item item);
}
