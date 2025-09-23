package com.group7.ecommerce.springbackend.order;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/discount-codes")
public class DiscountCodeController {

    private final DiscountCodeRepository discountCodeRepository;

    public DiscountCodeController(DiscountCodeRepository discountCodeRepository) {
        this.discountCodeRepository = discountCodeRepository;
    }

    @GetMapping
    public ResponseEntity<List<DiscountCode>> getAllDiscountCodes() {
        List<DiscountCode> codes = discountCodeRepository.findAll();
        return ResponseEntity.ok(codes);
    }

    @PostMapping
    public ResponseEntity<DiscountCode> createDiscountCode(@RequestBody DiscountCode discountCode) {
        try {
            DiscountCode savedCode = discountCodeRepository.save(discountCode);
            return ResponseEntity.ok(savedCode);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiscountCode> updateDiscountCode(@PathVariable Long id,
            @RequestBody DiscountCode discountCode) {
        try {
            DiscountCode existingCode = discountCodeRepository.findById(id)
                    .orElseThrow(() -> new NoSuchElementException("Discount code not found"));

            existingCode.setCode(discountCode.getCode());
            existingCode.setDiscountPercentage(discountCode.getDiscountPercentage());
            existingCode.setExpiryDate(discountCode.getExpiryDate());
            existingCode.setActive(discountCode.isActive());

            DiscountCode updatedCode = discountCodeRepository.save(existingCode);
            return ResponseEntity.ok(updatedCode);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDiscountCode(@PathVariable Long id) {
        try {
            discountCodeRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{code}/validate")
    public ResponseEntity<DiscountCode> validateDiscountCode(@PathVariable String code) {
        try {
            DiscountCode discountCode = discountCodeRepository.findByCode(code)
                    .orElseThrow(() -> new NoSuchElementException("Discount code not found"));

            if (!discountCode.isActive()) {
                return ResponseEntity.badRequest().build();
            }

            return ResponseEntity.ok(discountCode);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
