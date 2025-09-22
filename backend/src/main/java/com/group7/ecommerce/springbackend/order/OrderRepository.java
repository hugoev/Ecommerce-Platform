package com.group7.ecommerce.springbackend.order;

import com.group7.ecommerce.springbackend.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findAllByUserOrderByOrderDateDesc(User user, Pageable pageable);

    Page<Order> findAllByOrderByOrderDateDesc(Pageable pageable);

    Page<Order> findAllByOrderByUser(Pageable pageable);

    Page<Order> findAllByOrderByTotalDesc(Pageable pageable);
}
