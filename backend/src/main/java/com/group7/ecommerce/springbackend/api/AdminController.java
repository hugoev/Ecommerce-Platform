package com.group7.ecommerce.springbackend.api;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.group7.ecommerce.springbackend.item.Item;
import com.group7.ecommerce.springbackend.item.ItemRepository;
import com.group7.ecommerce.springbackend.order.DiscountCode;
import com.group7.ecommerce.springbackend.order.DiscountCodeRepository;
import com.group7.ecommerce.springbackend.order.Order;
import com.group7.ecommerce.springbackend.order.OrderRepository;
import com.group7.ecommerce.springbackend.user.User;
import com.group7.ecommerce.springbackend.user.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ItemRepository itemRepository;
    private final DiscountCodeRepository discountCodeRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    // Item Management
    @PostMapping("/items")
    public Item createItem(@RequestBody Item item) {
        return itemRepository.save(item);
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<Item> updateItem(@PathVariable Long id, @RequestBody Item itemDetails) {
        Item item = itemRepository.findById(id).orElseThrow(() -> new RuntimeException("Item not found"));
        item.setTitle(itemDetails.getTitle());
        item.setDescription(itemDetails.getDescription());
        item.setPrice(itemDetails.getPrice());
        item.setQuantityAvailable(itemDetails.getQuantityAvailable());
        item.setImageUrl(itemDetails.getImageUrl());
        item.setCategory(itemDetails.getCategory());
        item.setSku(itemDetails.getSku());
        item.setOnSale(itemDetails.isOnSale());
        item.setDiscountedPrice(itemDetails.getDiscountedPrice());
        return ResponseEntity.ok(itemRepository.save(item));
    }

    // Discount Code Management
    @PostMapping("/discounts")
    public DiscountCode createDiscountCode(@RequestBody DiscountCode discountCode) {
        return discountCodeRepository.save(discountCode);
    }

    // User Management
    @GetMapping("/users")
    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    // Order Management
    @GetMapping("/orders")
    public Page<Order> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable);
    }
}
