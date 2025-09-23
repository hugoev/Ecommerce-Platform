package com.group7.ecommerce.springbackend.data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.group7.ecommerce.springbackend.item.Item;
import com.group7.ecommerce.springbackend.item.ItemRepository;
import com.group7.ecommerce.springbackend.order.DiscountCode;
import com.group7.ecommerce.springbackend.order.DiscountCodeRepository;
import com.group7.ecommerce.springbackend.user.User;
import com.group7.ecommerce.springbackend.user.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DiscountCodeRepository discountCodeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Only seed if database is empty
        if (itemRepository.count() == 0) {
            seedItems();
        }

        if (userRepository.count() == 0) {
            seedUsers();
        }

        if (discountCodeRepository.count() == 0) {
            seedDiscountCodes();
        }
    }

    private void seedItems() {
        // Electronics
        Item laptop = new Item();
        laptop.setTitle("MacBook Pro 16-inch");
        laptop.setDescription("Apple MacBook Pro with M2 chip, 16GB RAM, 512GB SSD");
        laptop.setPrice(new BigDecimal("2499.99"));
        laptop.setQuantityAvailable(10);
        laptop.setImageUrl("https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500");
        laptop.setCategory("Electronics");
        laptop.setSku("MBP-16-M2-512");
        itemRepository.save(laptop);

        Item phone = new Item();
        phone.setTitle("iPhone 15 Pro");
        phone.setDescription("Latest iPhone with titanium design and A17 Pro chip");
        phone.setPrice(new BigDecimal("999.99"));
        phone.setQuantityAvailable(25);
        phone.setImageUrl("https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500");
        phone.setCategory("Electronics");
        phone.setSku("IPH-15-PRO-128");
        itemRepository.save(phone);

        Item headphones = new Item();
        headphones.setTitle("Sony WH-1000XM5");
        headphones.setDescription("Premium noise-canceling wireless headphones");
        headphones.setPrice(new BigDecimal("399.99"));
        headphones.setQuantityAvailable(15);
        headphones.setImageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500");
        headphones.setCategory("Electronics");
        headphones.setSku("SONY-WH-1000XM5");
        itemRepository.save(headphones);

        // Clothing
        Item tshirt = new Item();
        tshirt.setTitle("Classic Cotton T-Shirt");
        tshirt.setDescription("100% cotton, comfortable fit, available in multiple colors");
        tshirt.setPrice(new BigDecimal("29.99"));
        tshirt.setQuantityAvailable(50);
        tshirt.setImageUrl("https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500");
        tshirt.setCategory("Clothing");
        tshirt.setSku("TSH-COTTON-001");
        itemRepository.save(tshirt);

        Item jeans = new Item();
        jeans.setTitle("Slim Fit Jeans");
        jeans.setDescription("Classic blue denim jeans with modern slim fit");
        jeans.setPrice(new BigDecimal("79.99"));
        jeans.setQuantityAvailable(30);
        jeans.setImageUrl("https://images.unsplash.com/photo-1542272604-787c12538374?w=500");
        jeans.setCategory("Clothing");
        jeans.setSku("JNS-SLIM-001");
        itemRepository.save(jeans);

        // Books
        Item book = new Item();
        book.setTitle("Clean Code");
        book.setDescription("A Handbook of Agile Software Craftsmanship by Robert C. Martin");
        book.setPrice(new BigDecimal("49.99"));
        book.setQuantityAvailable(20);
        book.setImageUrl("https://images.unsplash.com/photo-1544947950-fa07a98d641f?w=500");
        book.setCategory("Books");
        book.setSku("BOOK-CLEAN-CODE");
        itemRepository.save(book);

        Item notebook = new Item();
        notebook.setTitle("Moleskine Classic Notebook");
        notebook.setDescription("Hard cover, ruled pages, perfect for writing and sketching");
        notebook.setPrice(new BigDecimal("24.99"));
        notebook.setQuantityAvailable(40);
        notebook.setImageUrl("https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500");
        notebook.setCategory("Books");
        notebook.setSku("NOTE-MOLESKINE-001");
        itemRepository.save(notebook);

        // Home & Garden
        Item plant = new Item();
        plant.setTitle("Monstera Deliciosa Plant");
        plant.setDescription("Large tropical houseplant, perfect for home decoration");
        plant.setPrice(new BigDecimal("89.99"));
        plant.setQuantityAvailable(12);
        plant.setImageUrl("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500");
        plant.setCategory("Home & Garden");
        plant.setSku("PLANT-MONSTERA-001");
        itemRepository.save(plant);

        Item lamp = new Item();
        lamp.setTitle("Modern Table Lamp");
        lamp.setDescription("LED table lamp with adjustable brightness and USB charging port");
        lamp.setPrice(new BigDecimal("129.99"));
        lamp.setQuantityAvailable(8);
        lamp.setImageUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500");
        lamp.setCategory("Home & Garden");
        lamp.setSku("LAMP-MODERN-001");
        itemRepository.save(lamp);

        // Sports
        Item sneakers = new Item();
        sneakers.setTitle("Nike Air Max 270");
        sneakers.setDescription("Comfortable running shoes with Air Max cushioning");
        sneakers.setPrice(new BigDecimal("149.99"));
        sneakers.setQuantityAvailable(35);
        sneakers.setImageUrl("https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500");
        sneakers.setCategory("Sports");
        sneakers.setSku("SHOE-NIKE-AM270");
        itemRepository.save(sneakers);

        System.out.println("✅ Seeded " + itemRepository.count() + " items");
    }

    private void seedUsers() {
        // Create admin user
        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setFirstName("Admin");
        admin.setLastName("User");
        admin.setRole(User.Role.ROLE_ADMIN);
        admin.setCreatedAt(LocalDateTime.now());
        admin.setIsActive(true);
        userRepository.save(admin);

        // Create regular users
        User user1 = new User();
        user1.setUsername("john_doe");
        user1.setPassword(passwordEncoder.encode("password123"));
        user1.setFirstName("John");
        user1.setLastName("Doe");
        user1.setRole(User.Role.ROLE_USER);
        user1.setCreatedAt(LocalDateTime.now());
        user1.setIsActive(true);
        user1.setAddress("123 Main St, New York, NY 10001");
        user1.setPhone("(555) 123-4567");
        userRepository.save(user1);

        User user2 = new User();
        user2.setUsername("jane_smith");
        user2.setPassword(passwordEncoder.encode("password123"));
        user2.setFirstName("Jane");
        user2.setLastName("Smith");
        user2.setRole(User.Role.ROLE_USER);
        user2.setCreatedAt(LocalDateTime.now());
        user2.setIsActive(true);
        user2.setAddress("456 Oak Ave, Los Angeles, CA 90210");
        user2.setPhone("(555) 987-6543");
        userRepository.save(user2);

        User user3 = new User();
        user3.setUsername("bob_wilson");
        user3.setPassword(passwordEncoder.encode("password123"));
        user3.setFirstName("Bob");
        user3.setLastName("Wilson");
        user3.setRole(User.Role.ROLE_USER);
        user3.setCreatedAt(LocalDateTime.now());
        user3.setIsActive(true);
        user3.setAddress("789 Pine St, Chicago, IL 60601");
        user3.setPhone("(555) 456-7890");
        userRepository.save(user3);

        System.out.println("✅ Seeded " + userRepository.count() + " users");
    }

    private void seedDiscountCodes() {
        // Create discount codes
        DiscountCode welcome = new DiscountCode();
        welcome.setCode("WELCOME10");
        welcome.setDiscountPercentage(new BigDecimal("10.00"));
        welcome.setExpiryDate(OffsetDateTime.now().plusMonths(3));
        welcome.setActive(true);
        discountCodeRepository.save(welcome);

        DiscountCode summer = new DiscountCode();
        summer.setCode("SUMMER20");
        summer.setDiscountPercentage(new BigDecimal("20.00"));
        summer.setExpiryDate(OffsetDateTime.now().plusWeeks(2));
        summer.setActive(true);
        discountCodeRepository.save(summer);

        DiscountCode student = new DiscountCode();
        student.setCode("STUDENT15");
        student.setDiscountPercentage(new BigDecimal("15.00"));
        student.setExpiryDate(OffsetDateTime.now().plusMonths(6));
        student.setActive(true);
        discountCodeRepository.save(student);

        DiscountCode expired = new DiscountCode();
        expired.setCode("EXPIRED5");
        expired.setDiscountPercentage(new BigDecimal("5.00"));
        expired.setExpiryDate(OffsetDateTime.now().minusDays(1));
        expired.setActive(false);
        discountCodeRepository.save(expired);

        System.out.println("✅ Seeded " + discountCodeRepository.count() + " discount codes");
    }
}
