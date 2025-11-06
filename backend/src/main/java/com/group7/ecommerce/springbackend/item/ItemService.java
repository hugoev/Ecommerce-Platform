package com.group7.ecommerce.springbackend.item;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.NoSuchElementException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.group7.ecommerce.springbackend.sales.SalesItemRepository;

@Service
public class ItemService {
    private final ItemRepository repo;
    private final SalesItemRepository salesItemRepository;

    public ItemService(ItemRepository repo, SalesItemRepository salesItemRepository) {
        this.repo = repo;
        this.salesItemRepository = salesItemRepository;
    }

    public Page<Item> getAll(String q, Pageable pageable) {
        if (q == null || q.isBlank())
            return repo.findAll(pageable);
        return repo.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(q, q, pageable);
    }

    public Item add(Item item) {
        return repo.save(item);
    }

    public Item getById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Item " + id + " not found"));
    }

    @Transactional
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new NoSuchElementException("Item " + id + " not found");
        }
        
        // Get the item to access its imageUrl before deletion
        Item item = repo.findById(id).orElseThrow(() -> new NoSuchElementException("Item " + id + " not found"));
        
        // Delete the image file if it's a local upload
        if (item.getImageUrl() != null) {
            try {
                String filename = null;
                
                // Handle relative URL (e.g., "/images/uuid.jpg")
                if (item.getImageUrl().startsWith("/images/")) {
                    filename = item.getImageUrl().substring("/images/".length());
                }
                // Handle absolute URL (e.g., "http://localhost:8080/images/uuid.jpg")
                else if (item.getImageUrl().contains("/images/")) {
                    int imagesIndex = item.getImageUrl().lastIndexOf("/images/");
                    filename = item.getImageUrl().substring(imagesIndex + "/images/".length());
                }
                
                // Delete the file if we found a local filename
                if (filename != null && !filename.isEmpty()) {
                    Path imagePath = Paths.get("uploads/images/", filename);
                    if (Files.exists(imagePath)) {
                        Files.delete(imagePath);
                    }
                }
            } catch (IOException e) {
                // Log the error but don't fail the deletion if file deletion fails
                System.err.println("Failed to delete image file for item " + id + ": " + e.getMessage());
            }
        }
        
        // Delete all related sales items first to avoid foreign key constraint violation
        salesItemRepository.deleteByItemId(id);
        repo.deleteById(id);
    }

    public Item replace(Long id, Item body) {
        Item existing = repo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Item " + id + " not found"));

        // replace all updatable fields
        existing.setTitle(body.getTitle());
        existing.setDescription(body.getDescription());
        existing.setPrice(body.getPrice());
        existing.setQuantityAvailable(body.getQuantityAvailable());
        existing.setImageUrl(body.getImageUrl());
        existing.setCategory(body.getCategory());
        if (body.getSku() != null)
            existing.setSku(body.getSku());

        return repo.save(existing);
    }

    public Item update(Long id, Item updates) {
        Item existing = getById(id);
        if (updates.getTitle() != null)
            existing.setTitle(updates.getTitle());
        if (updates.getDescription() != null)
            existing.setDescription(updates.getDescription());
        if (updates.getPrice() != null)
            existing.setPrice(updates.getPrice());
        if (updates.getQuantityAvailable() != 0)
            existing.setQuantityAvailable(updates.getQuantityAvailable());
        if (updates.getImageUrl() != null)
            existing.setImageUrl(updates.getImageUrl());
        if (updates.getCategory() != null)
            existing.setCategory(updates.getCategory());
        if (updates.getSku() != null)
            existing.setSku(updates.getSku());
        return repo.save(existing);
    }

}
