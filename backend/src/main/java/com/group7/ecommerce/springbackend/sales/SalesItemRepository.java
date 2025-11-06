package com.group7.ecommerce.springbackend.sales;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalesItemRepository extends JpaRepository<SalesItem, Long> {
    List<SalesItem> findByIsActiveTrue();
    Optional<SalesItem> findByItemIdAndIsActiveTrue(Long itemId);
    List<SalesItem> findByItemId(Long itemId);
    void deleteByItemId(Long itemId);
}

