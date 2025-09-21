package com.group7.ecommerce.springbackend.item;

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
    public List<Item> listItems() {
        return service.getAll();
    }

    @PostMapping
    public Item createItem(@RequestBody Item item) {
        return service.add(item);
    }
}

