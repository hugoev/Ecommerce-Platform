package com.group7.ecommerce.springbackend;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.group7.ecommerce.springbackend.item.Item;
import com.group7.ecommerce.springbackend.item.ItemController;
import com.group7.ecommerce.springbackend.item.ItemService;

@WebMvcTest(ItemController.class)
public class ItemControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ItemService itemService;

    @InjectMocks
    private ItemController itemController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(itemController).build();
    }

    @Test
    void shouldReturnItems() throws Exception {
        // Given
        Item item1 = new Item("Test Item 1", "Description 1", new BigDecimal("29.99"), 10, "image1.jpg", "Electronics",
                "SKU001");
        Item item2 = new Item("Test Item 2", "Description 2", new BigDecimal("49.99"), 5, "image2.jpg", "Clothing",
                "SKU002");

        List<Item> items = Arrays.asList(item1, item2);
        Page<Item> itemPage = new PageImpl<>(items, PageRequest.of(0, 20), items.size());

        when(itemService.getAll(any(String.class), any(Pageable.class))).thenReturn(itemPage);

        // When & Then
        mockMvc.perform(get("/api/items"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.pagination.totalElements").value(2));
    }

    @Test
    void shouldReturnItemById() throws Exception {
        // Given
        Item item = new Item("Test Item", "Description", new BigDecimal("29.99"), 10, "image.jpg", "Electronics",
                "SKU001");
        when(itemService.getById(anyLong())).thenReturn(item);

        // When & Then
        mockMvc.perform(get("/api/items/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Test Item"));
    }

    @Test
    void shouldHandleNotFound() throws Exception {
        // Given
        when(itemService.getById(anyLong())).thenThrow(new NoSuchElementException("Item not found"));

        // When & Then
        mockMvc.perform(get("/api/items/999"))
                .andExpect(status().isNotFound());
    }
}
