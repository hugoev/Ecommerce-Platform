package com.group7.ecommerce.springbackend.sales;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.group7.ecommerce.springbackend.item.Item;
import com.group7.ecommerce.springbackend.item.ItemRepository;

@Service
public class SalesItemService {

    private final SalesItemRepository salesItemRepository;
    private final ItemRepository itemRepository;

    public SalesItemService(SalesItemRepository salesItemRepository, ItemRepository itemRepository) {
        this.salesItemRepository = salesItemRepository;
        this.itemRepository = itemRepository;
    }

    public List<SalesItemDto> getAll() {
        return salesItemRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<SalesItemDto> getActive() {
        return salesItemRepository.findByIsActiveTrue().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public SalesItemDto getById(Long id) {
        SalesItem salesItem = salesItemRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Sales item not found"));
        return toDto(salesItem);
    }

    @Transactional
    public SalesItemDto create(CreateSalesItemRequest request) {
        Item item = itemRepository.findById(request.getItemId())
                .orElseThrow(() -> new NoSuchElementException("Item not found"));

        // Check if item already has an active sale
        List<SalesItem> existingSales = salesItemRepository.findByItemId(item.getId());
        if (existingSales.stream().anyMatch(s -> s.isActive())) {
            throw new IllegalArgumentException("Item already has an active sale");
        }

        SalesItem salesItem = new SalesItem(
                item,
                request.getSalePrice(),
                request.getSaleStartDate(),
                request.getSaleEndDate()
        );
        salesItem.setActive(true);

        SalesItem saved = salesItemRepository.save(salesItem);
        return toDto(saved);
    }

    @Transactional
    public SalesItemDto update(Long id, UpdateSalesItemRequest request) {
        SalesItem salesItem = salesItemRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Sales item not found"));

        if (request.getSalePrice() != null) {
            salesItem.setSalePrice(request.getSalePrice());
        }
        if (request.getSaleStartDate() != null) {
            salesItem.setSaleStartDate(request.getSaleStartDate());
        }
        if (request.getSaleEndDate() != null) {
            salesItem.setSaleEndDate(request.getSaleEndDate());
        }

        SalesItem updated = salesItemRepository.save(salesItem);
        return toDto(updated);
    }

    @Transactional
    public SalesItemDto toggleActive(Long id) {
        SalesItem salesItem = salesItemRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Sales item not found"));
        salesItem.setActive(!salesItem.isActive());
        SalesItem updated = salesItemRepository.save(salesItem);
        return toDto(updated);
    }

    @Transactional
    public void delete(Long id) {
        if (!salesItemRepository.existsById(id)) {
            throw new NoSuchElementException("Sales item not found");
        }
        salesItemRepository.deleteById(id);
    }

    private SalesItemDto toDto(SalesItem salesItem) {
        SalesItemDto dto = new SalesItemDto();
        Item item = salesItem.getItem();

        dto.setId(salesItem.getId());
        dto.setItemId(item.getId());
        dto.setTitle(item.getTitle());
        dto.setDescription(item.getDescription());
        dto.setOriginalPrice(item.getPrice());
        dto.setSalePrice(salesItem.getSalePrice());
        dto.setQuantityAvailable(item.getQuantityAvailable());
        dto.setImageUrl(item.getImageUrl());
        dto.setCategory(item.getCategory());
        dto.setSku(item.getSku());
        dto.setSaleStartDate(salesItem.getSaleStartDate());
        dto.setSaleEndDate(salesItem.getSaleEndDate());
        dto.setActive(salesItem.isActive());

        // Calculate discount percentage
        BigDecimal discountAmount = item.getPrice().subtract(salesItem.getSalePrice());
        BigDecimal discountPercentage = discountAmount.divide(item.getPrice(), 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));
        dto.setDiscountPercentage(discountPercentage.setScale(2, RoundingMode.HALF_UP));

        return dto;
    }

    public static class CreateSalesItemRequest {
        private Long itemId;
        private BigDecimal salePrice;
        private OffsetDateTime saleStartDate;
        private OffsetDateTime saleEndDate;

        public Long getItemId() {
            return itemId;
        }

        public void setItemId(Long itemId) {
            this.itemId = itemId;
        }

        public BigDecimal getSalePrice() {
            return salePrice;
        }

        public void setSalePrice(BigDecimal salePrice) {
            this.salePrice = salePrice;
        }

        public OffsetDateTime getSaleStartDate() {
            return saleStartDate;
        }

        public void setSaleStartDate(OffsetDateTime saleStartDate) {
            this.saleStartDate = saleStartDate;
        }

        public OffsetDateTime getSaleEndDate() {
            return saleEndDate;
        }

        public void setSaleEndDate(OffsetDateTime saleEndDate) {
            this.saleEndDate = saleEndDate;
        }
    }

    public static class UpdateSalesItemRequest {
        private BigDecimal salePrice;
        private OffsetDateTime saleStartDate;
        private OffsetDateTime saleEndDate;

        public BigDecimal getSalePrice() {
            return salePrice;
        }

        public void setSalePrice(BigDecimal salePrice) {
            this.salePrice = salePrice;
        }

        public OffsetDateTime getSaleStartDate() {
            return saleStartDate;
        }

        public void setSaleStartDate(OffsetDateTime saleStartDate) {
            this.saleStartDate = saleStartDate;
        }

        public OffsetDateTime getSaleEndDate() {
            return saleEndDate;
        }

        public void setSaleEndDate(OffsetDateTime saleEndDate) {
            this.saleEndDate = saleEndDate;
        }
    }

    public static class SalesItemDto {
        private Long id;
        private Long itemId;
        private String title;
        private String description;
        private BigDecimal originalPrice;
        private BigDecimal salePrice;
        private BigDecimal discountPercentage;
        private int quantityAvailable;
        private String imageUrl;
        private String category;
        private String sku;
        private OffsetDateTime saleStartDate;
        private OffsetDateTime saleEndDate;
        private boolean isActive;

        // Getters and setters
        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public Long getItemId() {
            return itemId;
        }

        public void setItemId(Long itemId) {
            this.itemId = itemId;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public BigDecimal getOriginalPrice() {
            return originalPrice;
        }

        public void setOriginalPrice(BigDecimal originalPrice) {
            this.originalPrice = originalPrice;
        }

        public BigDecimal getSalePrice() {
            return salePrice;
        }

        public void setSalePrice(BigDecimal salePrice) {
            this.salePrice = salePrice;
        }

        public BigDecimal getDiscountPercentage() {
            return discountPercentage;
        }

        public void setDiscountPercentage(BigDecimal discountPercentage) {
            this.discountPercentage = discountPercentage;
        }

        public int getQuantityAvailable() {
            return quantityAvailable;
        }

        public void setQuantityAvailable(int quantityAvailable) {
            this.quantityAvailable = quantityAvailable;
        }

        public String getImageUrl() {
            return imageUrl;
        }

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public String getSku() {
            return sku;
        }

        public void setSku(String sku) {
            this.sku = sku;
        }

        public OffsetDateTime getSaleStartDate() {
            return saleStartDate;
        }

        public void setSaleStartDate(OffsetDateTime saleStartDate) {
            this.saleStartDate = saleStartDate;
        }

        public OffsetDateTime getSaleEndDate() {
            return saleEndDate;
        }

        public void setSaleEndDate(OffsetDateTime saleEndDate) {
            this.saleEndDate = saleEndDate;
        }

        public boolean isActive() {
            return isActive;
        }

        public void setActive(boolean active) {
            isActive = active;
        }
    }
}

