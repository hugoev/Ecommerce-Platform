package com.group7.ecommerce.springbackend.item;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.NoSuchElementException;


@Service
public class ItemService {
    private final ItemRepository repo;

    public ItemService(ItemRepository repo) {
        this.repo = repo;
    }

    public Page<Item> getAll(String q, Pageable pageable) {
        if (q == null || q.isBlank()) return repo.findAll(pageable);
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

        return repo.save(existing);
    }

    public Item update(Long id, Item updates) {
        Item existing = getById(id);
        if (updates.getTitle() != null) existing.setTitle(updates.getTitle());
        if (updates.getDescription() != null) existing.setDescription(updates.getDescription());
        if (updates.getPrice() != null) existing.setPrice(updates.getPrice());
        if (updates.getQuantityAvailable() != null) existing.setQuantityAvailable(updates.getQuantityAvailable());
        return repo.save(existing);
    }


}
