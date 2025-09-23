package com.group7.ecommerce.springbackend.order;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.group7.ecommerce.springbackend.cart.CartDto;
import com.group7.ecommerce.springbackend.cart.CartService;
import com.group7.ecommerce.springbackend.user.User;
import com.group7.ecommerce.springbackend.user.UserRepository;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final UserRepository userRepository;

    public OrderController(OrderService orderService,
            OrderRepository orderRepository,
            CartService cartService,
            UserRepository userRepository) {
        this.orderService = orderService;
        this.orderRepository = orderRepository;
        this.cartService = cartService;
        this.userRepository = userRepository;
    }

    @PostMapping("/{userId}/place")
    public ResponseEntity<Order> placeOrder(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new NoSuchElementException("User not found"));

            CartDto cartDto = cartService.getCartAsDto(userId);

            if (cartDto.getItems().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            Order order = orderService.placeOrder(cartDto, user);

            // Clear the cart after successful order placement
            cartService.clearCart(userId);

            return ResponseEntity.ok(order);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable Long userId) {
        try {
            List<Order> orders = orderRepository.findByUserIdOrderByOrderDateDesc(userId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{userId}/{orderId}")
    public ResponseEntity<Order> getOrder(@PathVariable Long userId, @PathVariable Long orderId) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new NoSuchElementException("Order not found"));

            if (!order.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            return ResponseEntity.ok(order);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long orderId,
            @RequestBody UpdateOrderStatusRequest request) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new NoSuchElementException("Order not found"));

            order.setStatus(request.getStatus());
            Order updatedOrder = orderRepository.save(order);

            return ResponseEntity.ok(updatedOrder);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Admin endpoints
    @GetMapping("/admin/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        try {
            List<Order> orders = orderRepository.findAllByOrderByOrderDateDesc();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/admin/status/{status}")
    public ResponseEntity<List<Order>> getOrdersByStatus(@PathVariable String status) {
        try {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            List<Order> orders = orderRepository.findByStatusOrderByOrderDateDesc(orderStatus);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // DTOs for request/response
    public static class UpdateOrderStatusRequest {
        private Order.OrderStatus status;

        public UpdateOrderStatusRequest() {
        }

        public Order.OrderStatus getStatus() {
            return status;
        }

        public void setStatus(Order.OrderStatus status) {
            this.status = status;
        }
    }
}
