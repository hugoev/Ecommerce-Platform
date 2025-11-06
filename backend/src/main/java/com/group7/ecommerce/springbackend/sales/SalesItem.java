package com.group7.ecommerce.springbackend.sales;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import com.group7.ecommerce.springbackend.item.Item;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "sales_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    private BigDecimal salePrice;
    private OffsetDateTime saleStartDate;
    private OffsetDateTime saleEndDate;
    private boolean isActive;

    public SalesItem(Item item, BigDecimal salePrice, OffsetDateTime saleStartDate, OffsetDateTime saleEndDate) {
        this.item = item;
        this.salePrice = salePrice;
        this.saleStartDate = saleStartDate;
        this.saleEndDate = saleEndDate;
        this.isActive = true;
    }
}
