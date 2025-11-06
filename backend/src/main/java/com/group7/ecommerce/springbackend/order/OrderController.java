package com.group7.ecommerce.springbackend.order;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

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
import com.group7.ecommerce.springbackend.common.ApiResponse;
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
    public ResponseEntity<OrderDto> placeOrder(@PathVariable Long userId) {
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

            return ResponseEntity.ok(toDto(order));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<OrderDto>> getUserOrders(@PathVariable Long userId) {
        try {
            List<Order> orders = orderRepository.findByUserIdOrderByOrderDateDesc(userId);
            List<OrderDto> orderDtos = orders.stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(orderDtos);
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
    public ResponseEntity<ApiResponse<OrderDto>> updateOrderStatus(@PathVariable Long orderId,
            @RequestBody UpdateOrderStatusRequest request) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new NoSuchElementException("Order not found"));

            // Handle both enum and string status
            Order.OrderStatus status;
            if (request.getStatus() != null) {
                status = request.getStatus();
            } else if (request.getStatusString() != null) {
                status = Order.OrderStatus.valueOf(request.getStatusString().toUpperCase());
            } else {
                return ResponseEntity.badRequest().build();
            }

            order.setStatus(status);
            Order updatedOrder = orderRepository.save(order);

            return ResponseEntity.ok(ApiResponse.success(toDto(updatedOrder), "Order status updated successfully"));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Admin endpoints
    @GetMapping("/admin/all")
    public ResponseEntity<ApiResponse<List<OrderDto>>> getAllOrders() {
        try {
            List<Order> orders = orderRepository.findAllByOrderByOrderDateDesc();
            List<OrderDto> orderDtos = orders.stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponse.success(orderDtos));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/admin/status/{status}")
    public ResponseEntity<ApiResponse<List<OrderDto>>> getOrdersByStatus(@PathVariable String status) {
        try {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            List<Order> orders = orderRepository.findByStatusOrderByOrderDateDesc(orderStatus);
            List<OrderDto> orderDtos = orders.stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponse.success(orderDtos));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Helper method to convert Order to OrderDto
    private OrderDto toDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setUserId(order.getUser().getId());
        dto.setUserUsername(order.getUser().getUsername());
        dto.setStatus(order.getStatus().name());
        dto.setSubtotal(order.getSubtotal());
        dto.setTax(order.getTax());
        dto.setDiscountAmount(order.getDiscountAmount());
        dto.setTotal(order.getTotal());
        dto.setAppliedDiscountCode(order.getAppliedDiscountCode());
        dto.setOrderDate(order.getOrderDate());

        List<OrderItemDto> orderItemDtos = order.getOrderItems().stream()
                .map(item -> {
                    OrderItemDto itemDto = new OrderItemDto();
                    itemDto.setItemId(item.getItem().getId());
                    itemDto.setItemName(item.getItem().getTitle());
                    itemDto.setQuantity(item.getQuantity());
                    itemDto.setPriceAtPurchase(item.getPriceAtPurchase());
                    return itemDto;
                })
                .collect(Collectors.toList());
        dto.setOrderItems(orderItemDtos);

        return dto;
    }

    // DTOs for request/response
    public static class UpdateOrderStatusRequest {
        private Order.OrderStatus status;
        private String statusString;

        public UpdateOrderStatusRequest() {
        }

        public Order.OrderStatus getStatus() {
            return status;
        }

        public void setStatus(Order.OrderStatus status) {
            this.status = status;
        }

        public String getStatusString() {
            return statusString;
        }

        public void setStatusString(String statusString) {
            this.statusString = statusString;
        }
    }
}
