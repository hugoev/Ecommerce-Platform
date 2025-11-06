package com.group7.ecommerce.springbackend.sales;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.group7.ecommerce.springbackend.common.ApiResponse;
import com.group7.ecommerce.springbackend.sales.SalesItemService.SalesItemDto;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin(origins = "*") // Allow all origins for public access
public class SalesItemController {

    private final SalesItemService salesItemService;

    public SalesItemController(SalesItemService salesItemService) {
        this.salesItemService = salesItemService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SalesItemDto>>> getAll() {
        List<SalesItemDto> salesItems = salesItemService.getAll();
        return ResponseEntity.ok(ApiResponse.success(salesItems));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SalesItemDto>> getById(@PathVariable Long id) {
        SalesItemDto salesItem = salesItemService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(salesItem));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SalesItemDto>> create(
            @RequestBody @Valid SalesItemService.CreateSalesItemRequest request) {
        SalesItemDto salesItem = salesItemService.create(request);
        return ResponseEntity.ok(ApiResponse.success(salesItem, "Sales item created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SalesItemDto>> update(
            @PathVariable Long id,
            @RequestBody @Valid SalesItemService.UpdateSalesItemRequest request) {
        SalesItemDto salesItem = salesItemService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success(salesItem, "Sales item updated successfully"));
    }

    @PutMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SalesItemDto>> toggleActive(@PathVariable Long id) {
        SalesItemDto salesItem = salesItemService.toggleActive(id);
        return ResponseEntity.ok(ApiResponse.success(salesItem, "Sales item status toggled successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        salesItemService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Sales item deleted successfully"));
    }
}

