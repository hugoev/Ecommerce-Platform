# E-Commerce Backend API

Spring Boot REST API for the e-commerce platform with JWT authentication, PostgreSQL database, and comprehensive business logic.

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
cd ..
docker compose up backend
```

### Local Development

```bash
# Ensure PostgreSQL is running
# Update application.properties with your database credentials

./mvnw spring-boot:run
```

Backend runs on **http://localhost:8080**

## 🏗️ Architecture

### Layered Architecture

```
Controller Layer (@RestController)
    ↓
Service Layer (@Service)
    ↓
Repository Layer (@Repository)
    ↓
Entity Layer (@Entity)
```

### Package Structure

```
com.group7.ecommerce.springbackend/
├── api/              # Admin controllers
├── cart/             # Shopping cart logic
│   ├── Cart.java
│   ├── CartController.java
│   ├── CartService.java
│   └── CartRepository.java
├── item/             # Product management
│   ├── Item.java
│   ├── ItemController.java
│   ├── ItemService.java
│   └── ItemRepository.java
├── order/            # Order processing
│   ├── Order.java
│   ├── OrderController.java
│   ├── OrderService.java
│   ├── OrderRepository.java
│   ├── DiscountCode.java
│   └── DiscountCodeRepository.java
├── user/             # User management
│   ├── User.java
│   ├── UserController.java
│   ├── UserService.java
│   └── UserRepository.java
├── security/         # JWT authentication
│   ├── JwtUtil.java
│   ├── JwtRequestFilter.java
│   ├── SecurityConfig.java
│   └── UserDetailsServiceImpl.java
├── common/           # Shared utilities
│   ├── ApiResponse.java
│   ├── CorsConfig.java
│   └── WebConfig.java
└── SpringBackendApplication.java
```

## 🔐 Security Features

### JWT Authentication

- Tokens generated on login
- 24-hour expiration (configurable)
- HS512 algorithm
- Stored in `Authorization: Bearer <token>` header

### Password Security

- BCrypt hashing with salt
- Minimum 8 characters
- Validation on registration

### Role-Based Access

- `ROLE_USER` - Standard user access
- `ROLE_ADMIN` - Full administrative access

### Endpoint Security

```java
// Public endpoints
/api/auth/**, /api/items/**, /images/**

// User endpoints (JWT required)
/api/cart/**, /api/orders/**

// Admin endpoints (Admin role required)
/api/admin/**
```

## 📦 Key Features

### Shopping Cart

- Persistent cart per user
- Real-time total calculation
- Tax calculation (8.25%)
- Discount code support
- Stock validation

### Order Management

- Order placement from cart
- Status tracking (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
- Order history
- Admin order management

### Product Management

- CRUD operations
- Image upload support
- Category filtering
- Search functionality
- Stock management

### Tax & Discount Logic

```java
// Tax calculation (8.25% rate)
BigDecimal taxableAmount = subtotal.subtract(discountAmount);
BigDecimal tax = taxableAmount.multiply(TAX_RATE);

// Total calculation
BigDecimal total = taxableAmount.add(tax);
```

## 🗄️ Database

### Tables

- `users` - User accounts with roles
- `items` - Product catalog
- `carts` - User shopping carts
- `cart_items` - Items in cart
- `orders` - Placed orders
- `order_items` - Items in orders
- `discount_codes` - Promotional codes

### Flyway Migrations

Located in `src/main/resources/db/migration/`

- `V1__Initial_Schema.sql` - Creates all tables
- `V2__Make_Email_Optional.sql` - Makes email optional

### Data Seeding

`DataInitializer.java` seeds:

- Admin user: `admin` / `admin123`
- Regular users: `john_doe`, `jane_smith`, `bob_wilson` (all with password `password123`)
- 10 sample products across 5 categories (Electronics, Clothing, Books, Home & Garden, Sports)
- 4 discount codes: `WELCOME10` (10%), `SUMMER20` (20%), `STUDENT15` (15%), `EXPIRED5` (5%, expired for testing)

## 🔧 Configuration

### application.properties

```properties
# Server
server.port=8080

# Database (H2 for local dev)
spring.datasource.url=jdbc:h2:file:./data/testdb
spring.datasource.username=sa
spring.datasource.password=password

# For Docker/Production (PostgreSQL)
# Set via environment variables:
# SPRING_DATASOURCE_URL
# SPRING_DATASOURCE_USERNAME
# SPRING_DATASOURCE_PASSWORD

# JPA
spring.jpa.hibernate.ddl-auto=create

# JWT
jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION}

# Flyway (disabled for H2, enabled for PostgreSQL)
spring.flyway.enabled=false
```

### Environment Variables

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/ecommerce
SPRING_DATASOURCE_USERNAME=ecommerce_user
SPRING_DATASOURCE_PASSWORD=ecommerce_password
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=86400
```

## 🧪 Testing

```bash
# Run all tests
./mvnw test

# Run specific test
./mvnw test -Dtest=CartServiceTest

# Build without tests
./mvnw clean install -DskipTests
```

## 📝 Best Practices Implemented

### Code Quality

- ✅ Constructor-based dependency injection
- ✅ Service layer for business logic
- ✅ DTO pattern for data transfer
- ✅ Exception handling with proper HTTP status codes
- ✅ Input validation with `@Valid`
- ✅ Lombok for reducing boilerplate

### Security

- ✅ BCrypt password hashing
- ✅ JWT token authentication
- ✅ Role-based authorization
- ✅ CORS configuration
- ✅ SQL injection prevention (JPA)

### Database

- ✅ Flyway for schema versioning
- ✅ Proper entity relationships
- ✅ Transaction management
- ✅ Connection pooling (HikariCP)

### API Design

- ✅ RESTful endpoints
- ✅ Consistent response format
- ✅ Proper HTTP methods and status codes
- ✅ Pagination support
- ✅ Error handling

## 🛠️ Common Development Tasks

### Add New Entity

1. Create `@Entity` class
2. Create `@Repository` interface
3. Create `@Service` class
4. Create `@RestController` class
5. Add Flyway migration if needed

### Add New Endpoint

```java
@GetMapping("/api/items")
public ResponseEntity<ApiResponse<List<Item>>> getItems() {
    List<Item> items = itemService.findAll();
    return ResponseEntity.ok(ApiResponse.success(items));
}
```

### Add Database Migration

1. Create `V{version}__Description.sql` in `src/main/resources/db/migration/`
2. Write SQL statements
3. Restart application (Flyway runs automatically)

## 🐛 Troubleshooting

**Port 8080 in use:**

```bash
lsof -ti:8080 | xargs kill -9
```

**Database connection failed:**

- Check PostgreSQL is running
- Verify credentials in `.env`
- Check Flyway migrations

**JWT token issues:**

- Ensure `JWT_SECRET` is set and consistent
- Check token hasn't expired
- Verify `Authorization: Bearer <token>` header

**Flyway migration error:**

```bash
# Reset database (development only!)
docker compose down -v
docker compose up --build
```

## 📚 Dependencies

Key dependencies (see `pom.xml`):

- Spring Boot 3.5.6
- Spring Security
- Spring Data JPA
- PostgreSQL Driver
- H2 Database (dev)
- Flyway
- JWT (jjwt 0.12.3)
- Lombok
- Validation API

## 🔗 Related Documentation

- Main README: `../README.md`
- API Guide: `../FRONTEND_API_GUIDE.md`
- Deployment: `../EC2_DEPLOYMENT_README.md`

---

**Pro Tips:**

- Use H2 console at http://localhost:8080/h2-console for local development
- Check logs with `docker compose logs backend`
- Use Postman/curl for API testing
- Review `SecurityConfig.java` for endpoint permissions
