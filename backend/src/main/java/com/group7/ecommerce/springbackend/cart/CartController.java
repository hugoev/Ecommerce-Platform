package com.group7.ecommerce.springbackend.cart;

import java.util.NoSuchElementException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<Cart> getCart(@PathVariable Long userId) {
        try {
            Cart cart = cartService.getCart(userId);
            return ResponseEntity.ok(cart);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{userId}/items/{itemId}")
    public ResponseEntity<Cart> addItemToCart(
            @PathVariable Long userId,
            @PathVariable Long itemId,
            @RequestBody @Valid AddItemRequest request) {
        try {
            Cart cart = cartService.addItemToCart(userId, itemId, request.getQuantity());
            return ResponseEntity.ok(cart);
        } catch (NoSuchElementException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{userId}/items/{itemId}")
    public ResponseEntity<Cart> updateItemQuantity(
            @PathVariable Long userId,
            @PathVariable Long itemId,
            @RequestBody @Valid UpdateQuantityRequest request) {
        try {
            Cart cart = cartService.updateItemQuantity(userId, itemId, request.getQuantity());
            return ResponseEntity.ok(cart);
        } catch (NoSuchElementException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{userId}/items/{itemId}")
    public ResponseEntity<Cart> removeItemFromCart(@PathVariable Long userId, @PathVariable Long itemId) {
        try {
            Cart cart = cartService.removeItemFromCart(userId, itemId);
            return ResponseEntity.ok(cart);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> clearCart(@PathVariable Long userId) {
        try {
            cartService.clearCart(userId);
            return ResponseEntity.ok().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{userId}/summary")
    public ResponseEntity<CartDto> getCartSummary(@PathVariable Long userId) {
        try {
            CartDto cartDto = cartService.getCartAsDto(userId);
            return ResponseEntity.ok(cartDto);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{userId}/discount")
    public ResponseEntity<CartDto> applyDiscountCode(
            @PathVariable Long userId,
            @RequestBody @Valid ApplyDiscountRequest request) {
        try {
            CartDto cartDto = cartService.applyDiscountCode(userId, request.getDiscountCode());
            return ResponseEntity.ok(cartDto);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{userId}/items/{itemId}/increase")
    public ResponseEntity<Cart> increaseItemQuantity(
            @PathVariable Long userId,
            @PathVariable Long itemId,
            @RequestBody @Valid ChangeQuantityRequest request) {
        try {
            Cart cart = cartService.increaseItemQuantity(userId, itemId, request.getAmount());
            return ResponseEntity.ok(cart);
        } catch (NoSuchElementException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{userId}/items/{itemId}/decrease")
    public ResponseEntity<Cart> decreaseItemQuantity(
            @PathVariable Long userId,
            @PathVariable Long itemId,
            @RequestBody @Valid ChangeQuantityRequest request) {
        try {
            Cart cart = cartService.decreaseItemQuantity(userId, itemId, request.getAmount());
            return ResponseEntity.ok(cart);
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
