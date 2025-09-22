package com.group7.ecommerce.springbackend.order;

import com.group7.ecommerce.springbackend.cart.CartDto;
import com.group7.ecommerce.springbackend.cart.CartItemDto;
import com.group7.ecommerce.springbackend.item.Item;
import com.group7.ecommerce.springbackend.item.ItemRepository;
import com.group7.ecommerce.springbackend.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ItemRepository itemRepository;

    public OrderService(OrderRepository orderRepository, ItemRepository itemRepository) {
        this.orderRepository = orderRepository;
        this.itemRepository = itemRepository;
    }

    @Transactional
    public Order placeOrder(CartDto cartDto, User user) {
        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(OffsetDateTime.now());
        order.setStatus(Order.OrderStatus.PENDING);
        order.setSubtotal(cartDto.getSubtotal());
        order.setTax(cartDto.getTax());
        order.setDiscountAmount(cartDto.getDiscountAmount());
        order.setTotal(cartDto.getTotal());
        order.setAppliedDiscountCode(cartDto.getAppliedDiscountCode());

        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItemDto itemDto : cartDto.getItems()) {
            Item item = itemRepository.findById(itemDto.getItemId())
                    .orElseThrow(() -> new IllegalArgumentException("Item not found: " + itemDto.getItemId()));

            if (item.getQuantityAvailable() < itemDto.getQuantity()) {
                throw new IllegalStateException("Not enough stock for item: " + item.getName());
            }

            item.setQuantityAvailable(item.getQuantityAvailable() - itemDto.getQuantity());
            itemRepository.save(item);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setItem(item);
            orderItem.setQuantity(itemDto.getQuantity());
            orderItem.setPriceAtPurchase(itemDto.getPrice());
            orderItems.add(orderItem);
        }

        order.setOrderItems(orderItems);
        return orderRepository.save(order);
    }
}
