package com.group7.ecommerce.springbackend.api;

import com.group7.ecommerce.springbackend.cart.CartDto;
import com.group7.ecommerce.springbackend.cart.CartService;
import com.group7.ecommerce.springbackend.order.Order;
import com.group7.ecommerce.springbackend.order.OrderService;
import com.group7.ecommerce.springbackend.user.User;
import com.group7.ecommerce.springbackend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final CartService cartService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<Order> placeOrder(@RequestBody CartDto cartDto, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Recalculate cart on the backend to ensure data integrity
        CartDto calculatedCart = cartService.calculateCart(cartDto);

        Order order = orderService.placeOrder(calculatedCart, user);
        return ResponseEntity.ok(order);
    }
}
