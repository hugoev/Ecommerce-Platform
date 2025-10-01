package com.group7.ecommerce.springbackend.cart;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.group7.ecommerce.springbackend.item.Item;
import com.group7.ecommerce.springbackend.item.ItemRepository;
import com.group7.ecommerce.springbackend.order.DiscountCode;
import com.group7.ecommerce.springbackend.order.DiscountCodeRepository;
import com.group7.ecommerce.springbackend.user.User;
import com.group7.ecommerce.springbackend.user.UserRepository;

@Service
@Transactional
public class CartService {

    private static final BigDecimal TAX_RATE = new BigDecimal("0.0825");

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final DiscountCodeRepository discountCodeRepository;

    public CartService(CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ItemRepository itemRepository,
            UserRepository userRepository,
            DiscountCodeRepository discountCodeRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
        this.discountCodeRepository = discountCodeRepository;
    }

    public Cart getCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        return cartRepository.findByUserWithItems(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart(user);
                    return cartRepository.save(newCart);
                });
    }

    public Cart addItemToCart(Long userId, Long itemId, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new NoSuchElementException("Item not found"));

        if (item.getQuantityAvailable() < quantity) {
            throw new IllegalArgumentException("Insufficient stock available");
        }

        Cart cart = cartRepository.findByUserWithItems(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart(user);
                    return cartRepository.save(newCart);
                });

        Optional<CartItem> existingCartItem = cartItemRepository.findByCartAndItem(cart, item);

        if (existingCartItem.isPresent()) {
            CartItem cartItem = existingCartItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
            cartItemRepository.save(cartItem);
        } else {
            CartItem newCartItem = new CartItem(cart, item, quantity);
            cartItemRepository.save(newCartItem);
        }

        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    public Cart updateItemQuantity(Long userId, Long itemId, int quantity) {
        if (quantity < 0) {
            throw new IllegalArgumentException("Quantity cannot be negative");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new NoSuchElementException("Item not found"));

        Cart cart = cartRepository.findByUserWithItems(user)
                .orElseThrow(() -> new NoSuchElementException("Cart not found"));

        if (quantity == 0) {
            return removeItemFromCart(userId, itemId);
        }

        if (item.getQuantityAvailable() < quantity) {
            throw new IllegalArgumentException("Insufficient stock available");
        }

        CartItem cartItem = cartItemRepository.findByCartAndItem(cart, item)
                .orElseThrow(() -> new NoSuchElementException("Item not found in cart"));

        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);

        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    public Cart removeItemFromCart(Long userId, Long itemId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new NoSuchElementException("Item not found"));

        Cart cart = cartRepository.findByUserWithItems(user)
                .orElseThrow(() -> new NoSuchElementException("Cart not found"));

        cartItemRepository.deleteByCartAndItem(cart, item);

        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    public void clearCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        Cart cart = cartRepository.findByUserWithItems(user)
                .orElseThrow(() -> new NoSuchElementException("Cart not found"));

        cartItemRepository.deleteByCart(cart);
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);
    }

    public Cart increaseItemQuantity(Long userId, Long itemId, int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new NoSuchElementException("Item not found"));

        Cart cart = cartRepository.findByUserWithItems(user)
                .orElseThrow(() -> new NoSuchElementException("Cart not found"));

        CartItem cartItem = cartItemRepository.findByCartAndItem(cart, item)
                .orElseThrow(() -> new NoSuchElementException("Item not found in cart"));

        int newQuantity = cartItem.getQuantity() + amount;

        if (item.getQuantityAvailable() < newQuantity) {
            throw new IllegalArgumentException("Insufficient stock available");
        }

        cartItem.setQuantity(newQuantity);
        cartItemRepository.save(cartItem);

        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    public Cart decreaseItemQuantity(Long userId, Long itemId, int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new NoSuchElementException("Item not found"));

        Cart cart = cartRepository.findByUserWithItems(user)
                .orElseThrow(() -> new NoSuchElementException("Cart not found"));

        CartItem cartItem = cartItemRepository.findByCartAndItem(cart, item)
                .orElseThrow(() -> new NoSuchElementException("Item not found in cart"));

        int newQuantity = cartItem.getQuantity() - amount;

        if (newQuantity <= 0) {
            return removeItemFromCart(userId, itemId);
        }

        cartItem.setQuantity(newQuantity);
        cartItemRepository.save(cartItem);

        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
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
                if (code.isActive()
                        && (code.getExpiryDate() == null || code.getExpiryDate().isAfter(OffsetDateTime.now()))) {
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

    public CartDto getCartAsDto(Long userId) {
        Cart cart = getCart(userId);
        return convertToDto(cart);
    }

    public CartDto convertToDto(Cart cart) {
        CartDto cartDto = new CartDto();

        List<CartItem> cartItems = cartItemRepository.findByCart(cart);
        List<CartItemDto> itemDtos = cartItems.stream()
                .map(this::convertCartItemToDto)
                .toList();

        cartDto.setItems(itemDtos);
        return calculateCart(cartDto);
    }

    private CartItemDto convertCartItemToDto(CartItem cartItem) {
        CartItemDto dto = new CartItemDto();
        dto.setItemId(cartItem.getItem().getId());
        dto.setItemName(cartItem.getItem().getTitle());
        dto.setQuantity(cartItem.getQuantity());
        dto.setPrice(cartItem.getPriceAtAddition());
        return dto;
    }

    public CartDto applyDiscountCode(Long userId, String discountCode) {
        Cart cart = getCart(userId);
        CartDto cartDto = convertToDto(cart);
        cartDto.setAppliedDiscountCode(discountCode);
        return calculateCart(cartDto);
    }

}
