package com.group7.ecommerce.springbackend.data;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.group7.ecommerce.springbackend.item.Item;
import com.group7.ecommerce.springbackend.item.ItemRepository;
import com.group7.ecommerce.springbackend.order.DiscountCode;
import com.group7.ecommerce.springbackend.order.DiscountCodeRepository;
import com.group7.ecommerce.springbackend.order.Order;
import com.group7.ecommerce.springbackend.order.OrderItem;
import com.group7.ecommerce.springbackend.order.OrderRepository;
import com.group7.ecommerce.springbackend.sales.SalesItem;
import com.group7.ecommerce.springbackend.sales.SalesItemRepository;
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
    private SalesItemRepository salesItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final BigDecimal TAX_RATE = new BigDecimal("0.0825");

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

        // Seed sales items and orders only if items and users exist
        if (itemRepository.count() > 0 && userRepository.count() > 0) {
            if (salesItemRepository.count() == 0) {
                seedSalesItems();
            }

            if (orderRepository.count() == 0) {
                seedOrders();
            }
        }
    }

    private void seedItems() {
        // Electronics
        Item gamingLaptop = new Item();
        gamingLaptop.setTitle("Gaming Laptop RTX 4070");
        gamingLaptop.setDescription(
                "High-performance gaming laptop with NVIDIA RTX 4070, 32GB RAM, 1TB SSD, perfect for gaming and content creation");
        gamingLaptop.setPrice(new BigDecimal("1899.99"));
        gamingLaptop.setQuantityAvailable(8);
        gamingLaptop.setImageUrl("https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800");
        gamingLaptop.setCategory("Electronics");
        gamingLaptop.setSku("LAP-GAMING-RTX4070");
        itemRepository.save(gamingLaptop);

        Item smartwatch = new Item();
        smartwatch.setTitle("Smart Fitness Watch");
        smartwatch.setDescription(
                "Advanced fitness tracking watch with heart rate monitor, GPS, sleep tracking, and 7-day battery life");
        smartwatch.setPrice(new BigDecimal("299.99"));
        smartwatch.setQuantityAvailable(42);
        smartwatch.setImageUrl("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800");
        smartwatch.setCategory("Electronics");
        smartwatch.setSku("WATCH-SMART-FIT");
        itemRepository.save(smartwatch);

        Item wirelessEarbuds = new Item();
        wirelessEarbuds.setTitle("Premium Wireless Earbuds");
        wirelessEarbuds.setDescription(
                "True wireless earbuds with active noise cancellation, 30-hour battery, and crystal-clear sound quality");
        wirelessEarbuds.setPrice(new BigDecimal("179.99"));
        wirelessEarbuds.setQuantityAvailable(28);
        wirelessEarbuds.setImageUrl("https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800");
        wirelessEarbuds.setCategory("Electronics");
        wirelessEarbuds.setSku("EARBUDS-WIRELESS-PRO");
        itemRepository.save(wirelessEarbuds);

        Item tablet = new Item();
        tablet.setTitle("10-inch Android Tablet");
        tablet.setDescription(
                "Versatile 10-inch tablet with 128GB storage, perfect for work, entertainment, and creative projects");
        tablet.setPrice(new BigDecimal("349.99"));
        tablet.setQuantityAvailable(15);
        tablet.setImageUrl("https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800");
        tablet.setCategory("Electronics");
        tablet.setSku("TAB-ANDROID-10IN");
        itemRepository.save(tablet);

        // Clothing
        Item winterJacket = new Item();
        winterJacket.setTitle("Waterproof Winter Jacket");
        winterJacket.setDescription(
                "Insulated waterproof jacket with hood, perfect for cold weather and outdoor activities");
        winterJacket.setPrice(new BigDecimal("159.99"));
        winterJacket.setQuantityAvailable(22);
        winterJacket.setImageUrl("https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800");
        winterJacket.setCategory("Clothing");
        winterJacket.setSku("JKT-WINTER-WATER");
        itemRepository.save(winterJacket);

        Item runningShoes = new Item();
        runningShoes.setTitle("Professional Running Shoes");
        runningShoes.setDescription(
                "Lightweight running shoes with advanced cushioning technology for maximum comfort and performance");
        runningShoes.setPrice(new BigDecimal("129.99"));
        runningShoes.setQuantityAvailable(38);
        runningShoes.setImageUrl("https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800");
        runningShoes.setCategory("Clothing");
        runningShoes.setSku("SHOE-RUN-PRO");
        itemRepository.save(runningShoes);

        Item backpack = new Item();
        backpack.setTitle("Travel Backpack 40L");
        backpack.setDescription(
                "Durable travel backpack with laptop compartment, USB charging port, and multiple organizational pockets");
        backpack.setPrice(new BigDecimal("89.99"));
        backpack.setQuantityAvailable(31);
        backpack.setImageUrl("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800");
        backpack.setCategory("Clothing");
        backpack.setSku("BAG-TRAVEL-40L");
        itemRepository.save(backpack);

        // Books
        Item cookbook = new Item();
        cookbook.setTitle("The Complete Cookbook");
        cookbook.setDescription(
                "Comprehensive cookbook with over 500 recipes from around the world, perfect for home chefs");
        cookbook.setPrice(new BigDecimal("39.99"));
        cookbook.setQuantityAvailable(27);
        cookbook.setImageUrl("https://images.unsplash.com/photo-1504113888839-1c8eb50233d3?w=800");
        cookbook.setCategory("Books");
        cookbook.setSku("BOOK-COOK-COMPLETE");
        itemRepository.save(cookbook);

        Item journal = new Item();
        journal.setTitle("Leather Bound Journal");
        journal.setDescription(
                "Premium leather-bound journal with lined pages, perfect for writing, planning, and journaling");
        journal.setPrice(new BigDecimal("34.99"));
        journal.setQuantityAvailable(45);
        journal.setImageUrl("https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800");
        journal.setCategory("Books");
        journal.setSku("JRNL-LEATHER-LINED");
        itemRepository.save(journal);

        // Home & Garden
        Item coffeeMaker = new Item();
        coffeeMaker.setTitle("Programmable Coffee Maker");
        coffeeMaker.setDescription(
                "12-cup programmable coffee maker with thermal carafe, timer, and auto-shutoff feature");
        coffeeMaker.setPrice(new BigDecimal("79.99"));
        coffeeMaker.setQuantityAvailable(19);
        coffeeMaker.setImageUrl("https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800");
        coffeeMaker.setCategory("Home & Garden");
        coffeeMaker.setSku("COFFEE-MAKER-12CUP");
        itemRepository.save(coffeeMaker);

        Item throwPillows = new Item();
        throwPillows.setTitle("Decorative Throw Pillow Set");
        throwPillows.setDescription(
                "Set of 4 decorative throw pillows with premium covers, adds comfort and style to any room");
        throwPillows.setPrice(new BigDecimal("49.99"));
        throwPillows.setQuantityAvailable(33);
        throwPillows.setImageUrl("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800");
        throwPillows.setCategory("Home & Garden");
        throwPillows.setSku("PILLOW-SET-4PC");
        itemRepository.save(throwPillows);

        Item deskChair = new Item();
        deskChair.setTitle("Ergonomic Office Chair");
        deskChair.setDescription(
                "Comfortable ergonomic office chair with lumbar support, adjustable height, and 360-degree swivel");
        deskChair.setPrice(new BigDecimal("249.99"));
        deskChair.setQuantityAvailable(11);
        deskChair.setImageUrl("https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800");
        deskChair.setCategory("Home & Garden");
        deskChair.setSku("CHAIR-ERGONOMIC-OFF");
        itemRepository.save(deskChair);

        // Sports
        Item yogaMat = new Item();
        yogaMat.setTitle("Premium Yoga Mat");
        yogaMat.setDescription(
                "Non-slip yoga mat with extra cushioning, perfect for yoga, pilates, and fitness exercises");
        yogaMat.setPrice(new BigDecimal("59.99"));
        yogaMat.setQuantityAvailable(52);
        yogaMat.setImageUrl("https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800");
        yogaMat.setCategory("Sports");
        yogaMat.setSku("MAT-YOGA-PREMIUM");
        itemRepository.save(yogaMat);

        Item dumbbells = new Item();
        dumbbells.setTitle("Adjustable Dumbbell Set");
        dumbbells.setDescription("Pair of adjustable dumbbells, 5-50 lbs each, perfect for home gym workouts");
        dumbbells.setPrice(new BigDecimal("199.99"));
        dumbbells.setQuantityAvailable(14);
        dumbbells.setImageUrl("https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800");
        dumbbells.setCategory("Sports");
        dumbbells.setSku("DBL-ADJ-5-50LB");
        itemRepository.save(dumbbells);

        Item basketball = new Item();
        basketball.setTitle("Official Size Basketball");
        basketball.setDescription(
                "Professional-grade basketball with superior grip and durability, official size and weight");
        basketball.setPrice(new BigDecimal("34.99"));
        basketball.setQuantityAvailable(67);
        basketball.setImageUrl("https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800");
        basketball.setCategory("Sports");
        basketball.setSku("BALL-BASKETBALL-OFF");
        itemRepository.save(basketball);

        System.out.println("✅ Seeded " + itemRepository.count() + " items");
    }

    private void seedUsers() {
        // Create admin user
        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setFirstName("Alex");
        admin.setLastName("Martinez");
        admin.setRole(User.Role.ROLE_ADMIN);
        admin.setCreatedAt(LocalDateTime.now());
        admin.setIsActive(true);
        admin.setAddress("100 Tech Boulevard, Austin, TX 78701");
        admin.setPhone("(512) 555-0100");
        userRepository.save(admin);

        // Create regular users
        User user1 = new User();
        user1.setUsername("sarah_chen");
        user1.setPassword(passwordEncoder.encode("password123"));
        user1.setFirstName("Sarah");
        user1.setLastName("Chen");
        user1.setRole(User.Role.ROLE_USER);
        user1.setCreatedAt(LocalDateTime.now());
        user1.setIsActive(true);
        user1.setAddress("245 Maple Drive, Seattle, WA 98101");
        user1.setPhone("(206) 555-0200");
        userRepository.save(user1);

        User user2 = new User();
        user2.setUsername("michael_jones");
        user2.setPassword(passwordEncoder.encode("password123"));
        user2.setFirstName("Michael");
        user2.setLastName("Jones");
        user2.setRole(User.Role.ROLE_USER);
        user2.setCreatedAt(LocalDateTime.now());
        user2.setIsActive(true);
        user2.setAddress("789 Riverside Avenue, Portland, OR 97201");
        user2.setPhone("(503) 555-0300");
        userRepository.save(user2);

        User user3 = new User();
        user3.setUsername("emily_davis");
        user3.setPassword(passwordEncoder.encode("password123"));
        user3.setFirstName("Emily");
        user3.setLastName("Davis");
        user3.setRole(User.Role.ROLE_USER);
        user3.setCreatedAt(LocalDateTime.now());
        user3.setIsActive(true);
        user3.setAddress("321 Park Street, Denver, CO 80202");
        user3.setPhone("(303) 555-0400");
        userRepository.save(user3);

        User user4 = new User();
        user4.setUsername("david_brown");
        user4.setPassword(passwordEncoder.encode("password123"));
        user4.setFirstName("David");
        user4.setLastName("Brown");
        user4.setRole(User.Role.ROLE_USER);
        user4.setCreatedAt(LocalDateTime.now());
        user4.setIsActive(true);
        user4.setAddress("567 Sunset Boulevard, Miami, FL 33101");
        user4.setPhone("(305) 555-0500");
        userRepository.save(user4);

        System.out.println("✅ Seeded " + userRepository.count() + " users");
    }

    private void seedDiscountCodes() {
        // Create discount codes
        DiscountCode newCustomer = new DiscountCode();
        newCustomer.setCode("NEWCUSTOMER25");
        newCustomer.setDiscountPercentage(new BigDecimal("25.00"));
        newCustomer.setExpiryDate(OffsetDateTime.now().plusMonths(6));
        newCustomer.setActive(true);
        discountCodeRepository.save(newCustomer);

        DiscountCode flashSale = new DiscountCode();
        flashSale.setCode("FLASH30");
        flashSale.setDiscountPercentage(new BigDecimal("30.00"));
        flashSale.setExpiryDate(OffsetDateTime.now().plusDays(7));
        flashSale.setActive(true);
        discountCodeRepository.save(flashSale);

        DiscountCode loyalty = new DiscountCode();
        loyalty.setCode("LOYALTY15");
        loyalty.setDiscountPercentage(new BigDecimal("15.00"));
        loyalty.setExpiryDate(OffsetDateTime.now().plusMonths(12));
        loyalty.setActive(true);
        discountCodeRepository.save(loyalty);

        DiscountCode holiday = new DiscountCode();
        holiday.setCode("HOLIDAY20");
        holiday.setDiscountPercentage(new BigDecimal("20.00"));
        holiday.setExpiryDate(OffsetDateTime.now().plusMonths(2));
        holiday.setActive(true);
        discountCodeRepository.save(holiday);

        DiscountCode expired = new DiscountCode();
        expired.setCode("OLDCODE10");
        expired.setDiscountPercentage(new BigDecimal("10.00"));
        expired.setExpiryDate(OffsetDateTime.now().minusDays(5));
        expired.setActive(false);
        discountCodeRepository.save(expired);

        System.out.println("✅ Seeded " + discountCodeRepository.count() + " discount codes");
    }

    private void seedSalesItems() {
        List<Item> items = itemRepository.findAll();
        if (items.size() < 5) {
            System.out.println("⚠️ Not enough items to seed sales items");
            return;
        }

        // Get some items for sales
        Item laptop = items.stream().filter(i -> i.getSku().equals("LAP-GAMING-RTX4070")).findFirst()
                .orElse(items.get(0));
        Item smartwatch = items.stream().filter(i -> i.getSku().equals("WATCH-SMART-FIT")).findFirst()
                .orElse(items.get(1));
        Item earbuds = items.stream().filter(i -> i.getSku().equals("EARBUDS-WIRELESS-PRO")).findFirst()
                .orElse(items.get(2));
        Item jacket = items.stream().filter(i -> i.getSku().equals("JKT-WINTER-WATER")).findFirst()
                .orElse(items.get(3));
        Item dumbbells = items.stream().filter(i -> i.getSku().equals("DBL-ADJ-5-50LB")).findFirst()
                .orElse(items.get(4));

        // Active sale - 20% off laptop
        SalesItem sale1 = new SalesItem();
        sale1.setItem(laptop);
        sale1.setSalePrice(laptop.getPrice().multiply(new BigDecimal("0.80")));
        sale1.setSaleStartDate(OffsetDateTime.now().minusDays(5));
        sale1.setSaleEndDate(OffsetDateTime.now().plusDays(10));
        sale1.setActive(true);
        salesItemRepository.save(sale1);

        // Active sale - 15% off smartwatch
        SalesItem sale2 = new SalesItem();
        sale2.setItem(smartwatch);
        sale2.setSalePrice(smartwatch.getPrice().multiply(new BigDecimal("0.85")));
        sale2.setSaleStartDate(OffsetDateTime.now().minusDays(2));
        sale2.setSaleEndDate(OffsetDateTime.now().plusDays(5));
        sale2.setActive(true);
        salesItemRepository.save(sale2);

        // Active sale - 25% off earbuds
        SalesItem sale3 = new SalesItem();
        sale3.setItem(earbuds);
        sale3.setSalePrice(earbuds.getPrice().multiply(new BigDecimal("0.75")));
        sale3.setSaleStartDate(OffsetDateTime.now().minusDays(1));
        sale3.setSaleEndDate(OffsetDateTime.now().plusDays(3));
        sale3.setActive(true);
        salesItemRepository.save(sale3);

        // Active sale - 30% off jacket
        SalesItem sale4 = new SalesItem();
        sale4.setItem(jacket);
        sale4.setSalePrice(jacket.getPrice().multiply(new BigDecimal("0.70")));
        sale4.setSaleStartDate(OffsetDateTime.now().minusDays(3));
        sale4.setSaleEndDate(OffsetDateTime.now().plusDays(7));
        sale4.setActive(true);
        salesItemRepository.save(sale4);

        // Upcoming sale - 20% off dumbbells (starts tomorrow)
        SalesItem sale5 = new SalesItem();
        sale5.setItem(dumbbells);
        sale5.setSalePrice(dumbbells.getPrice().multiply(new BigDecimal("0.80")));
        sale5.setSaleStartDate(OffsetDateTime.now().plusDays(1));
        sale5.setSaleEndDate(OffsetDateTime.now().plusDays(14));
        sale5.setActive(false); // Not active yet
        salesItemRepository.save(sale5);

        System.out.println("✅ Seeded " + salesItemRepository.count() + " sales items");
    }

    private void seedOrders() {
        List<User> users = userRepository.findAll();
        List<Item> items = itemRepository.findAll();
        List<DiscountCode> discountCodes = discountCodeRepository.findAll();

        if (users.isEmpty() || items.size() < 3) {
            System.out.println("⚠️ Not enough users or items to seed orders");
            return;
        }

        User user1 = users.stream().filter(u -> u.getUsername().equals("sarah_chen")).findFirst().orElse(users.get(0));
        User user2 = users.stream().filter(u -> u.getUsername().equals("michael_jones")).findFirst()
                .orElse(users.size() > 1 ? users.get(1) : users.get(0));
        User user3 = users.stream().filter(u -> u.getUsername().equals("emily_davis")).findFirst()
                .orElse(users.size() > 2 ? users.get(2) : users.get(0));
        User user4 = users.stream().filter(u -> u.getUsername().equals("david_brown")).findFirst()
                .orElse(users.size() > 3 ? users.get(3) : users.get(0));

        DiscountCode newCustomerCode = discountCodes.stream().filter(dc -> dc.getCode().equals("NEWCUSTOMER25"))
                .findFirst().orElse(null);
        DiscountCode loyaltyCode = discountCodes.stream().filter(dc -> dc.getCode().equals("LOYALTY15")).findFirst()
                .orElse(null);
        DiscountCode holidayCode = discountCodes.stream().filter(dc -> dc.getCode().equals("HOLIDAY20")).findFirst()
                .orElse(null);

        // Order 1: Sarah - Delivered order with discount
        createOrder(user1, items, List.of(items.get(0), items.get(1)), List.of(1, 1),
                Order.OrderStatus.DELIVERED, OffsetDateTime.now().minusDays(15), newCustomerCode);

        // Order 2: Michael - Shipped order
        createOrder(user2, items, List.of(items.get(2), items.get(5), items.get(8)), List.of(2, 1, 1),
                Order.OrderStatus.SHIPPED, OffsetDateTime.now().minusDays(5), null);

        // Order 3: Emily - Processing order with discount
        createOrder(user3, items, List.of(items.get(3), items.get(6)), List.of(1, 2),
                Order.OrderStatus.PROCESSING, OffsetDateTime.now().minusDays(2), loyaltyCode);

        // Order 4: David - Pending order
        createOrder(user4, items, List.of(items.get(4), items.get(7), items.get(9)), List.of(1, 1, 1),
                Order.OrderStatus.PENDING, OffsetDateTime.now().minusHours(2), null);

        // Order 5: Sarah - Delivered order (large order)
        createOrder(user1, items, List.of(items.get(0), items.get(10), items.get(11)), List.of(1, 1, 2),
                Order.OrderStatus.DELIVERED, OffsetDateTime.now().minusDays(30), holidayCode);

        // Order 6: Michael - Shipped order
        createOrder(user2, items, List.of(items.get(1), items.get(12)), List.of(1, 3),
                Order.OrderStatus.SHIPPED, OffsetDateTime.now().minusDays(8), null);

        // Order 7: Emily - Delivered order
        createOrder(user3, items, List.of(items.get(2), items.get(3), items.get(13)), List.of(2, 1, 1),
                Order.OrderStatus.DELIVERED, OffsetDateTime.now().minusDays(20), null);

        // Order 8: David - Processing order
        createOrder(user4, items, List.of(items.get(4), items.get(5)), List.of(1, 2),
                Order.OrderStatus.PROCESSING, OffsetDateTime.now().minusDays(1), loyaltyCode);

        // Order 9: Sarah - Cancelled order
        createOrder(user1, items, List.of(items.get(6), items.get(7)), List.of(1, 1),
                Order.OrderStatus.CANCELLED, OffsetDateTime.now().minusDays(10), null);

        // Order 10: Michael - Delivered order
        createOrder(user2, items, List.of(items.get(8), items.get(9), items.get(10), items.get(11)),
                List.of(1, 1, 1, 1),
                Order.OrderStatus.DELIVERED, OffsetDateTime.now().minusDays(25), null);

        System.out.println("✅ Seeded " + orderRepository.count() + " orders");
    }

    private void createOrder(User user, List<Item> allItems, List<Item> items, List<Integer> quantities,
            Order.OrderStatus status, OffsetDateTime orderDate, DiscountCode discountCode) {
        if (items.size() != quantities.size() || items.isEmpty()) {
            return;
        }

        Order order = new Order();
        order.setUser(user);
        order.setStatus(status);
        order.setOrderDate(orderDate);
        order.setAppliedDiscountCode(discountCode != null ? discountCode.getCode() : null);

        // Calculate subtotal
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (int i = 0; i < items.size(); i++) {
            Item item = items.get(i);
            int quantity = quantities.get(i);
            BigDecimal itemPrice = item.getPrice();

            subtotal = subtotal.add(itemPrice.multiply(new BigDecimal(quantity)));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setItem(item);
            orderItem.setQuantity(quantity);
            orderItem.setPriceAtPurchase(itemPrice);
            orderItems.add(orderItem);
        }

        // Calculate discount
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (discountCode != null && discountCode.isActive()) {
            discountAmount = subtotal.multiply(discountCode.getDiscountPercentage())
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        }

        // Calculate tax (8.25%)
        BigDecimal taxableAmount = subtotal.subtract(discountAmount);
        BigDecimal tax = taxableAmount.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);

        // Calculate total
        BigDecimal total = taxableAmount.add(tax);

        order.setSubtotal(subtotal);
        order.setDiscountAmount(discountAmount);
        order.setTax(tax);
        order.setTotal(total);
        order.setOrderItems(orderItems);

        orderRepository.save(order);
    }
}
