package com.group7.ecommerce.springbackend.cart;

import com.group7.ecommerce.springbackend.order.DiscountCode;
import com.group7.ecommerce.springbackend.order.DiscountCodeRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.Optional;

@Service
public class CartService {

    private static final BigDecimal TAX_RATE = new BigDecimal("0.0825");

    private final DiscountCodeRepository discountCodeRepository;

    public CartService(DiscountCodeRepository discountCodeRepository) {
        this.discountCodeRepository = discountCodeRepository;
    }

    // Placeholder methods - these would need proper implementation with repositories
    public Cart getCart(Long userId) {
        // TODO: Implement cart retrieval logic
        throw new UnsupportedOperationException("Cart functionality not yet implemented");
    }

    public Cart addItemToCart(Long userId, Long itemId, int quantity) {
        // TODO: Implement add item to cart logic
        throw new UnsupportedOperationException("Cart functionality not yet implemented");
    }

    public Cart updateItemQuantity(Long userId, Long itemId, int quantity) {
        // TODO: Implement update item quantity logic
        throw new UnsupportedOperationException("Cart functionality not yet implemented");
    }

    public Cart removeItemFromCart(Long userId, Long itemId) {
        // TODO: Implement remove item from cart logic
        throw new UnsupportedOperationException("Cart functionality not yet implemented");
    }

    public void clearCart(Long userId) {
        // TODO: Implement clear cart logic
        throw new UnsupportedOperationException("Cart functionality not yet implemented");
    }

    public Cart increaseItemQuantity(Long userId, Long itemId, int amount) {
        // TODO: Implement increase item quantity logic
        throw new UnsupportedOperationException("Cart functionality not yet implemented");
    }

    public Cart decreaseItemQuantity(Long userId, Long itemId, int amount) {
        // TODO: Implement decrease item quantity logic
        throw new UnsupportedOperationException("Cart functionality not yet implemented");
    }

    public CartDto calculateCart(CartDto cart) {
        BigDecimal subtotal = BigDecimal.ZERO;
        for (CartItemDto item : cart.getItems()) {
            item.setLineTotal(item.getPrice().multiply(new BigDecimal(item.getQuantity())));
            subtotal = subtotal.add(item.getLineTotal());
        }
        cart.setSubtotal(subtotal);

        BigDecimal discountAmount = BigDecimal.ZERO;
        if (cart.getAppliedDiscountCode() != null && !cart.getAppliedDiscountCode().isEmpty()) {
            Optional<DiscountCode> optionalCode = discountCodeRepository.findByCode(cart.getAppliedDiscountCode());
            if (optionalCode.isPresent()) {
                DiscountCode code = optionalCode.get();
                if (code.isActive() && (code.getExpiryDate() == null || code.getExpiryDate().isAfter(OffsetDateTime.now()))) {
                    BigDecimal discountPercentage = code.getDiscountPercentage().divide(new BigDecimal(100));
                    discountAmount = subtotal.multiply(discountPercentage);
                }
            }
        }
        cart.setDiscountAmount(discountAmount.setScale(2, RoundingMode.HALF_UP));

        BigDecimal taxableAmount = subtotal.subtract(discountAmount);
        BigDecimal tax = taxableAmount.multiply(TAX_RATE);
        cart.setTax(tax.setScale(2, RoundingMode.HALF_UP));

        BigDecimal total = taxableAmount.add(tax);
        cart.setTotal(total.setScale(2, RoundingMode.HALF_UP));

        return cart;
    }
}
