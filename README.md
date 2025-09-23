# E-Commerce Platform

A full-stack online shopping platform with Java Spring Boot backend, React frontend, and PostgreSQL database.

## 🚀 Quick Start

```bash
# Clone and start all services
git clone https://github.com/hugoev/Ecommerce-Platform.git
cd Ecommerce-Platform
docker compose up --build
```

**Access the application:**

- 🌐 **Frontend**: http://localhost:5173
- 🔧 **Backend API**: http://localhost:8080
- 🗄️ **Database**: localhost:5432

## 📁 Project Structure

```
Ecommerce-Platform/
├── backend/                 # Java Spring Boot API
│   ├── src/main/java/
│   │   └── com/group7/ecommerce/springbackend/
│   │       ├── api/         # REST controllers
│   │       ├── cart/       # Shopping cart logic
│   │       ├── item/       # Product management
│   │       ├── order/      # Order processing
│   │       ├── user/       # User management
│   │       └── security/   # JWT authentication
│   └── src/main/resources/
│       └── db/migration/   # Database migrations
├── frontend/               # React TypeScript SPA
│   ├── src/
│   │   ├── api/           # API service layer
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── types/         # TypeScript definitions
│   └── package.json
├── docker-compose.yml      # Container orchestration
└── README.md
```

## 🛠️ Development Setup

### Option 1: Docker Compose (Recommended)

```bash
docker compose up --build
```

### Option 2: Native Development

```bash
# 1. Start database
docker compose up -d db

# 2. Backend (Java/Spring)
cd backend
mvn spring-boot:run

# 3. Frontend (React/Vite)
cd frontend
npm install
npm run dev
```

## 🎯 Features

- **Authentication**: JWT-based user registration/login
- **Product Catalog**: Search, filter, and browse products
- **Shopping Cart**: Add/remove items, quantity management
- **Order Management**: Place orders, track status
- **Admin Dashboard**: Product and order management
- **Responsive Design**: Modern UI with Tailwind CSS

## 📋 Key Files

### Backend

- `SpringBackendApplication.java` - Main application entry point
- `application.properties` - Database and JWT configuration
- `V1__Initial_Schema.sql` - Database schema creation
- `V2__Make_Email_Optional.sql` - Email field removal migration
- `DataInitializer.java` - Seeds database with sample data

### Frontend

- `main.tsx` - React app entry point
- `App.tsx` - Main app component with routing
- `api/` - API service layer for backend communication
- `hooks/` - Custom React hooks for state management
- `pages/` - Application pages (Cart, Products, Admin, etc.)

### Configuration

- `docker-compose.yml` - Container orchestration
- `.env` - Environment variables
- `package.json` - Frontend dependencies
- `pom.xml` - Backend dependencies

---

## 🔧 Backend (Java Spring Boot)

- **Tech Stack**: Spring Boot 3, Java 17, PostgreSQL, JWT Authentication
- **Features**: RESTful API, role-based authorization, shopping cart, product management

- **Available Endpoints:**

  **🔐 Authentication Endpoints:**

  - `POST /api/auth/register` - User registration (username + password only)
  - `POST /api/auth/login` - User login (username + password)
  - `GET /api/auth/profile/{id}` - Get user profile
  - `PUT /api/auth/profile/{id}` - Update user profile
  - `POST /api/auth/change-password/{id}` - Change user password

  **🛍️ Public Endpoints:**

  - `GET /api/items` - Get all items (public catalog)
  - `GET /api/items/search?q={query}` - Search items by title/description

  **🛒 Shopping Cart Endpoints (Requires Authentication):**

  - `GET /api/cart/{userId}` - Get user's cart
  - `GET /api/cart/{userId}/summary` - Get cart summary with calculations
  - `POST /api/cart/{userId}/items/{itemId}` - Add item to cart
  - `PUT /api/cart/{userId}/items/{itemId}` - Update item quantity in cart
  - `DELETE /api/cart/{userId}/items/{itemId}` - Remove item from cart
  - `DELETE /api/cart/{userId}` - Clear entire cart
  - `POST /api/cart/{userId}/items/{itemId}/increase` - Increase item quantity
  - `POST /api/cart/{userId}/items/{itemId}/decrease` - Decrease item quantity
  - `POST /api/cart/{userId}/discount` - Apply discount code to cart

  **📦 Order Management Endpoints (Requires Authentication):**

  - `GET /api/orders` - Get user's order history
  - `POST /api/orders/place` - Place order from cart
  - `GET /api/orders/admin/all` - Get all orders (Admin only)
  - `PUT /api/orders/admin/{orderId}/status` - Update order status (Admin only)

  **👑 Admin Endpoints (Requires Admin Role):**

  - `GET /api/admin/items` - Get all items for management
  - `POST /api/admin/items` - Create new item
  - `PUT /api/admin/items/{id}` - Update item
  - `DELETE /api/admin/items/{id}` - Delete item
  - `GET /api/admin/discount-codes` - Get all discount codes
  - `POST /api/admin/discount-codes` - Create discount code
  - `PUT /api/admin/discount-codes/{id}` - Update discount code
  - `DELETE /api/admin/discount-codes/{id}` - Delete discount code
  - `GET /api/admin/sales` - Get sales items
  - `POST /api/admin/sales` - Create sales item
  - `PUT /api/admin/sales/{id}` - Update sales item
  - `DELETE /api/admin/sales/{id}` - Delete sales item

- **Example API Requests:**

  **User Registration:**

  ```bash
  curl -X POST http://localhost:8080/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"username":"newuser","password":"password123"}'
  ```

  **User Login:**

  ```bash
  curl -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"newuser","password":"password123"}'
  ```

  **Get Items (Public):**

  ```bash
  curl http://localhost:8080/api/items
  ```

  **Add Item to Cart (Requires JWT Token):**

  ```bash
  curl -X POST http://localhost:8080/api/cart/1/items/1 \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -d '{"quantity":2}'
  ```

  **Place Order (Requires JWT Token):**

  ```bash
  curl -X POST http://localhost:8080/api/orders/place \
    -H "Authorization: Bearer YOUR_JWT_TOKEN"
  ```

- **Authentication & Response Format:**

  **JWT Authentication:**

  - Most endpoints require a JWT token in the `Authorization` header
  - Format: `Authorization: Bearer <token>`
  - Tokens are obtained from the login endpoint
  - Tokens expire after the time specified in `JWT_EXPIRATION`

  **Standard Response Format:**

  ```json
  {
    "success": true,
    "message": "Operation successful",
    "data": {
      /* response data */
    },
    "timestamp": [2025, 9, 23, 5, 19, 17, 827022010],
    "pagination": null
  }
  ```

  **Error Response Format:**

  ```json
  {
    "status": 400,
    "error": "Bad Request",
    "message": "Validation failed",
    "timestamp": [2025, 9, 23, 5, 19, 17, 827022010]
  }
  ```

- **Environment Variables:**
  - `SPRING_DATASOURCE_URL`: JDBC connection string (set by Docker Compose).
  - `SPRING_DATASOURCE_USERNAME`: Database user (set by Docker Compose).
  - `SPRING_DATASOURCE_PASSWORD`: Database password (set by Docker Compose).
  - `JWT_SECRET`: Secret key for signing JWTs.
  - `JWT_EXPIRATION`: Token expiration time in seconds.

## 🎨 Frontend (React TypeScript)

- **Tech Stack**: React, TypeScript, Vite, Tailwind CSS, Redux Toolkit
- **Features**: SPA architecture, type-safe API calls, responsive design

## 🗃️ Database

- **Schema Management**: Flyway migrations in `backend/src/main/resources/db/migration/`
- **Tables**: users, items, orders, carts, cart_items with proper relationships
- **Seeded Data**: 10 sample products, 2 users, 3 discount codes

## 🛠️ Development Tips

### Backend Development

```bash
# Run tests
mvn test

# Check database connection
docker compose exec db psql -U ecommerce_user -d ecommerce

# View logs
docker compose logs backend
```

### Frontend Development

```bash
# Install dependencies
npm install

# Development server with hot reload
npm run dev

# Build for production
npm run build

# Type checking
npx tsc --noEmit
```

### Database Changes

1. Create migration file: `V3__Add_new_feature.sql`
2. Add your SQL statements
3. Restart backend: `docker compose restart backend`

### Common Commands

```bash
# Restart specific service
docker compose restart backend

# View all logs
docker compose logs

# Clean rebuild
docker compose down
docker compose up --build

# Access database
docker compose exec db psql -U ecommerce_user -d ecommerce
```

## 🔧 Environment Variables

Create `.env` file in project root:

```env
# Database
POSTGRES_DB=ecommerce
POSTGRES_USER=ecommerce_user
POSTGRES_PASSWORD=ecommerce_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=86400
```

## 🧪 Testing

### Backend Tests

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=UserServiceTest

# Run with coverage
mvn test jacoco:report
```

### Frontend Tests

```bash
# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Build test
npm run build
```

### API Testing

```bash
# Test user registration
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Test login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

## 🔄 Development Workflow

1. **Make changes** to backend or frontend code
2. **Test locally** using Docker Compose or native development
3. **Run tests** to ensure nothing is broken
4. **Commit changes** with descriptive messages
5. **Push to repository** for deployment

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request
```

## 🐛 Troubleshooting

- **Port conflicts**: Change ports in `docker-compose.yml`
- **Backend won't start**: Check database is running with `docker compose ps`
- **Frontend build errors**: Run `npm install` and check TypeScript errors
- **Database connection**: Verify `.env` file exists and database container is running
- **JWT token issues**: Check `JWT_SECRET` in `.env` file
- **CORS errors**: Verify backend CORS configuration in `SecurityConfig.java`
