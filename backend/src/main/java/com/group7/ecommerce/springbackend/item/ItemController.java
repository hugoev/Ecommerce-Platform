package com.group7.ecommerce.springbackend.item;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/items")
public class ItemController {
    private final ItemService service;

    public ItemController(ItemService service) {
        this.service = service;
    }

    @GetMapping
    public Page<Item> getAll(
            @RequestParam(required = false, name = "search") String search,
            @RequestParam(defaultValue = "price", name = "sortBy") String sortBy,
            @RequestParam(defaultValue = "asc", name = "sortDirection") String sortDirection,
            @RequestParam(defaultValue = "0", name = "pageNumber") int pageNumber,
            @RequestParam(defaultValue = "20", name = "pageSize") int pageSize
    ) {
        Sort s = sortDirection.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(pageNumber, pageSize, s);
        return service.getAll(search, pageable);
    }

    @PostMapping
    public Item createItem(@RequestBody Item item) {
        return service.add(item);
    }
}

