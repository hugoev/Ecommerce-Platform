package com.group7.ecommerce.springbackend.item;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.group7.ecommerce.springbackend.common.ApiResponse;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@RestController
@RequestMapping("/api/items")
@Validated
@CrossOrigin(origins = "*") // Allow all origins for public access
public class ItemController {
    private final ItemService service;

    public ItemController(ItemService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Item>>> getAll(
            @RequestParam(required = false, name = "search") String search,
            @RequestParam(defaultValue = "title", name = "sortBy") String sortBy,
            @RequestParam(defaultValue = "asc", name = "sortDirection") String sortDirection,
            @RequestParam(defaultValue = "0", name = "pageNumber") @Min(0) int pageNumber,
            @RequestParam(defaultValue = "20", name = "pageSize") @Min(1) @Max(100) int pageSize) {
        Sort s = sortDirection.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(pageNumber, pageSize, s);
        Page<Item> itemsPage = service.getAll(search, pageable);

        return ResponseEntity.ok(ApiResponse.success(itemsPage.getContent()));
    }

    @GetMapping("/{id}")
    @CrossOrigin
    public ResponseEntity<ApiResponse<ItemResponseDTO>> getById(@PathVariable Long id) {
        try {
            Item item = service.getById(id);
            ItemResponseDTO itemResponse = new ItemResponseDTO(item);
            return ResponseEntity.ok(ApiResponse.success(itemResponse));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ItemResponseDTO>> createItem(
            @RequestBody @Valid ItemRequestDTOs.CreateItemRequest itemRequest) {
        try {
            Item item = new Item(
                    itemRequest.getTitle(),
                    itemRequest.getDescription(),
                    itemRequest.getPrice(),
                    itemRequest.getQuantityAvailable(),
                    itemRequest.getImageUrl(),
                    itemRequest.getCategory(),
                    itemRequest.getSku());
            Item createdItem = service.add(item);
            ItemResponseDTO itemResponse = new ItemResponseDTO(createdItem);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(itemResponse, "Item created successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ItemResponseDTO>> replace(@PathVariable Long id,
            @RequestBody @Valid ItemRequestDTOs.CreateItemRequest itemRequest) {
        try {
            Item item = new Item(
                    itemRequest.getTitle(),
                    itemRequest.getDescription(),
                    itemRequest.getPrice(),
                    itemRequest.getQuantityAvailable(),
                    itemRequest.getImageUrl(),
                    itemRequest.getCategory(),
                    itemRequest.getSku());
            Item updatedItem = service.replace(id, item);
            ItemResponseDTO itemResponse = new ItemResponseDTO(updatedItem);
            return ResponseEntity.ok(ApiResponse.success(itemResponse, "Item updated successfully"));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<ItemResponseDTO>> update(@PathVariable Long id,
            @RequestBody @Valid ItemRequestDTOs.UpdateItemRequest updates) {
        try {
            Item item = new Item();
            if (updates.getTitle() != null)
                item.setTitle(updates.getTitle());
            if (updates.getDescription() != null)
                item.setDescription(updates.getDescription());
            if (updates.getPrice() != null)
                item.setPrice(updates.getPrice());
            if (updates.getQuantityAvailable() != null)
                item.setQuantityAvailable(updates.getQuantityAvailable());
            if (updates.getImageUrl() != null)
                item.setImageUrl(updates.getImageUrl());
            if (updates.getCategory() != null)
                item.setCategory(updates.getCategory());
            if (updates.getSku() != null)
                item.setSku(updates.getSku());

            Item updatedItem = service.update(id, item);
            ItemResponseDTO itemResponse = new ItemResponseDTO(updatedItem);
            return ResponseEntity.ok(ApiResponse.success(itemResponse, "Item updated successfully"));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        try {
            service.delete(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Item deleted successfully"));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<String>> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("File is empty"));
            }

            // Validate file type (only images)
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Only image files are allowed"));
            }

            // Validate file size (max 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(ApiResponse.error("File size must be less than 5MB"));
            }

            // Create uploads directory if it doesn't exist
            Path uploadPath = Paths.get("uploads/images/");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            if (originalFilename == null || originalFilename.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Invalid filename"));
            }
            
            // Extract file extension safely
            String fileExtension = ".img"; // Default extension
            int lastDotIndex = originalFilename.lastIndexOf(".");
            if (lastDotIndex > 0 && lastDotIndex < originalFilename.length() - 1) {
                fileExtension = originalFilename.substring(lastDotIndex);
            } else {
                // If no extension, try to determine from content type
                if (contentType != null) {
                    if (contentType.contains("jpeg") || contentType.contains("jpg")) {
                        fileExtension = ".jpg";
                    } else if (contentType.contains("png")) {
                        fileExtension = ".png";
                    } else if (contentType.contains("gif")) {
                        fileExtension = ".gif";
                    } else if (contentType.contains("webp")) {
                        fileExtension = ".webp";
                    }
                    // else keep default .img
                }
                // else keep default .img
            }
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

            // Save file
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Return the URL path for the uploaded image
            String imageUrl = "/images/" + uniqueFilename;
            return ResponseEntity.ok(ApiResponse.success(imageUrl, "Image uploaded successfully"));

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to upload image: " + e.getMessage()));
        }
    }

}
