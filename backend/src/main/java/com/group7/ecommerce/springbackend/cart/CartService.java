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