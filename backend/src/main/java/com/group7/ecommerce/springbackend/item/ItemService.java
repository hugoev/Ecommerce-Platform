package com.group7.ecommerce.springbackend.item;

import java.util.NoSuchElementException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ItemService {
    private final ItemRepository repo;

    public ItemService(ItemRepository repo) {
        this.repo = repo;
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

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new NoSuchElementException("Item " + id + " not found");
        }
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
