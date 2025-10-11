package com.group7.ecommerce.springbackend.cart;

import java.util.NoSuchElementException;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.group7.ecommerce.springbackend.user.User;
import com.group7.ecommerce.springbackend.user.UserRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    public CartController(CartService cartService, UserRepository userRepository) {
        this.cartService = cartService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("CartController - Authentication: " + authentication);
        System.out.println("CartController - Authentication is authenticated: "
                + (authentication != null ? authentication.isAuthenticated() : "null"));

        if (authentication == null || !authentication.isAuthenticated()) {
            System.out.println("CartController - User not authenticated");
            throw new RuntimeException("User not authenticated");
        }

        Object principal = authentication.getPrincipal();
        System.out.println("CartController - Principal: " + principal);
        System.out.println(
                "CartController - Principal type: " + (principal != null ? principal.getClass().getName() : "null"));

        // The principal is a UserDetails object, not the User entity
        if (principal instanceof org.springframework.security.core.userdetails.User) {
            org.springframework.security.core.userdetails.User userDetails = (org.springframework.security.core.userdetails.User) principal;
            String username = userDetails.getUsername();
            System.out.println("CartController - Found authenticated user: " + username);

            // Look up the User entity by username
            return userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));
        }

        throw new RuntimeException("Unable to get authenticated user");
    }

    @GetMapping
    public ResponseEntity<Cart> getCart() {
        try {
            User user = getCurrentUser();
            Cart cart = cartService.getCart(user.getId());
            return ResponseEntity.ok(cart);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/items/{itemId}")
    public ResponseEntity<CartDto> addItemToCart(
            @PathVariable Long itemId,
            @RequestBody @Valid AddItemRequest request) {
        try {
            User user = getCurrentUser();
            Cart cart = cartService.addItemToCart(user.getId(), itemId, request.getQuantity());
            CartDto cartDto = cartService.convertToDto(cart);
            return ResponseEntity.ok(cartDto);
        } catch (NoSuchElementException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartDto> updateItemQuantity(
            @PathVariable Long itemId,
            @RequestBody @Valid UpdateQuantityRequest request) {
        try {
            User user = getCurrentUser();
            Cart cart = cartService.updateItemQuantity(user.getId(), itemId, request.getQuantity());
            CartDto cartDto = cartService.convertToDto(cart);
            return ResponseEntity.ok(cartDto);
        } catch (NoSuchElementException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartDto> removeItemFromCart(@PathVariable Long itemId) {
        try {
            User user = getCurrentUser();
            Cart cart = cartService.removeItemFromCart(user.getId(), itemId);
            CartDto cartDto = cartService.convertToDto(cart);
            return ResponseEntity.ok(cartDto);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping
    public ResponseEntity<CartDto> clearCart() {
        try {
            User user = getCurrentUser();
            cartService.clearCart(user.getId());
            CartDto cartDto = cartService.getCartAsDto(user.getId());
            return ResponseEntity.ok(cartDto);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<CartDto> getCartSummary() {
        try {
            User user = getCurrentUser();
            CartDto cartDto = cartService.getCartAsDto(user.getId());
            return ResponseEntity.ok(cartDto);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/discount")
    public ResponseEntity<CartDto> applyDiscountCode(
            @RequestBody @Valid ApplyDiscountRequest request) {
        try {
            User user = getCurrentUser();
            CartDto cartDto = cartService.applyDiscountCode(user.getId(), request.getDiscountCode());
            return ResponseEntity.ok(cartDto);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/items/{itemId}/increase")
    public ResponseEntity<CartDto> increaseItemQuantity(
            @PathVariable Long itemId,
            @RequestBody @Valid ChangeQuantityRequest request) {
        try {
            User user = getCurrentUser();
            Cart cart = cartService.increaseItemQuantity(user.getId(), itemId, request.getAmount());
            CartDto cartDto = cartService.convertToDto(cart);
            return ResponseEntity.ok(cartDto);
        } catch (NoSuchElementException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/items/{itemId}/decrease")
    public ResponseEntity<CartDto> decreaseItemQuantity(
            @PathVariable Long itemId,
            @RequestBody @Valid ChangeQuantityRequest request) {
        try {
            User user = getCurrentUser();
            Cart cart = cartService.decreaseItemQuantity(user.getId(), itemId, request.getAmount());
            CartDto cartDto = cartService.convertToDto(cart);
            return ResponseEntity.ok(cartDto);
        } catch (NoSuchElementException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // DTOs for request/response
    public static class AddItemRequest {
        private int quantity;

        public AddItemRequest() {
        }

        public int getQuantity() {
            return quantity;
        }

        public void setQuantity(int quantity) {
            this.quantity = quantity;
        }
    }

    public static class UpdateQuantityRequest {
        private int quantity;

        public UpdateQuantityRequest() {
        }

        public int getQuantity() {
            return quantity;
        }

        public void setQuantity(int quantity) {
            this.quantity = quantity;
        }
    }

    public static class ChangeQuantityRequest {
        private int amount;

        public ChangeQuantityRequest() {
        }

        public int getAmount() {
            return amount;
        }

        public void setAmount(int amount) {
            this.amount = amount;
        }
    }

    public static class ApplyDiscountRequest {
        private String discountCode;

        public ApplyDiscountRequest() {
        }

        public String getDiscountCode() {
            return discountCode;
        }

        public void setDiscountCode(String discountCode) {
            this.discountCode = discountCode;
        }
    }
}
