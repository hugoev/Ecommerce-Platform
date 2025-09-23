package com.group7.ecommerce.springbackend.order;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.group7.ecommerce.springbackend.user.User;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findAllByUserOrderByOrderDateDesc(User user, Pageable pageable);

    Page<Order> findAllByOrderByOrderDateDesc(Pageable pageable);

    Page<Order> findAllByOrderByUser(Pageable pageable);

    Page<Order> findAllByOrderByTotalDesc(Pageable pageable);

    // Additional methods for the controller
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);

    List<Order> findAllByOrderByOrderDateDesc();

    List<Order> findByStatusOrderByOrderDateDesc(Order.OrderStatus status);
}
