# E-Commerce Platform - Developer Quickstart Guide

A full-stack online shopping platform featuring a Java Spring Boot backend, React frontend, and PostgreSQL database.

---

### 🏗️ Architecture Overview

- **Backend (`/backend`):** A RESTful API built with Java 17 and the Spring Boot framework.
- **Frontend (`/frontend`):** A Single-Page Application (SPA) built with React, TypeScript, and Vite.
- **Database:** A PostgreSQL database, managed via Docker Compose for consistency across all environments.

> ✅ **Status**: All services are fully functional and ready for development!

## 🚀 Quick Start (Recommended)

**Get everything running in 30 seconds:**

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

### 🎯 Current Features

**✅ Working Features:**

- User registration and authentication (JWT-based)
- Product catalog with search and filtering
- Admin dashboard for product management
- Shopping cart functionality (entity structure ready)
- Order history and management
- Responsive design with modern UI
- Database schema with proper relationships
- TypeScript compilation without errors
- Docker Compose orchestration

---

### 📋 Prerequisites

- **Java 17 (JDK):** For running the backend natively.
- **Maven:** For managing backend dependencies.
- **Node.js & npm:** For running the frontend natively.
- **Docker & Docker Compose:** For running the database or the entire application stack in containers.
- **Git:** For version control.

---

## 🚀 Native Development Quickstart

This guide is for developers who want to actively work on the project by running services on their local machine.

**1. Clone & Initial Setup**

```bash
# Clone the repository
git clone https://github.com/hugoev/Ecommerce-Platform.git
cd Ecommerce-Platform

# Copy the environment file. The defaults are ready for local development.
cp .env.example .env
```

**2. Start the Database**

We use Docker to run the database. This is the only container you need for native development.

```bash
# This command starts a PostgreSQL container in the background and runs migrations.
docker compose up -d db
```

**3. Backend Setup (Java/Spring)**

- Open the `/backend` directory in your favorite Java IDE (e.g., IntelliJ IDEA, VS Code).
- Your IDE will detect the `pom.xml` and should automatically download all Maven dependencies.
- The configuration in `backend/src/main/resources/application.properties` is pre-set to connect to the Dockerized database.
- Locate and run the main application class: `SpringBackendApplication.java`.

> ✅ The backend API is now running at **[http://localhost:8080](http://localhost:8080)**.

**4. Frontend Setup (React/Vite)**

- Open a new terminal window.

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

> ✅ The frontend application is now running at **[http://localhost:5173](http://localhost:5173)** with hot-reloading.

---

## 🐳 Docker Compose Full-Stack

This is the simplest way to run the entire application without installing Java or Node.js locally. It's ideal for quick previews or integration testing.

```bash
# This single command builds and starts the db, backend, and frontend.
docker compose up --build
```

> ✅ **All services will be available at:**
>
> - Frontend: http://localhost:5173
> - Backend API: http://localhost:8080
> - Database: localhost:5432

---

### 🛠️ Backend Details

- **Tech Stack:**

  - Framework: Spring Boot 3
  - Language: Java 17
  - Database: PostgreSQL with Flyway for migrations
  - Security: Spring Security with JWT authentication
  - Build: Apache Maven

- **Key Features:**

  - RESTful API with structured DTOs
  - Role-based authorization (USER, ADMIN)
  - JWT-based authentication
  - Shopping cart functionality
  - Product management (CRUD operations)
  - User registration and login
  - Database schema management with Flyway

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

### 🎨 Frontend Details

- **Tech Stack:**

  - Framework: React (with Vite)
  - Language: TypeScript
  - Styling: Tailwind CSS
  - State Management: Redux Toolkit
  - UI Components: Custom component library

- **Key Features:**

  - Single-Page Application architecture
  - Type-safe components and API calls
  - Environment-aware API configuration
  - User authentication and authorization
  - Product catalog with search and filtering
  - Admin dashboard for product management
  - Shopping cart functionality
  - Responsive design

- **Project Structure:**

  ```
  frontend/
  ├── src/
  │   ├── api/         # API service layer
  │   ├── app/         # Redux store configuration
  │   ├── components/  # Reusable UI components
  │   ├── pages/       # Application pages
  │   ├── types/       # TypeScript type definitions
  │   └── hooks/       # Custom React hooks
  ```

- **Available Scripts:**
  - `npm run dev`: Starts the development server with hot-reloading
  - `npm run build`: Creates a production-ready build in the `/dist` folder
  - `npm run preview`: Preview the production build locally

---

### 🧪 Testing

- **Backend Unit & Integration Tests:**
  Run the tests using the Maven wrapper inside the running backend container or natively.

  ```bash
  # Via Docker
  docker compose exec backend mvn test

  # Natively
  cd backend
  mvn test
  ```

---

### 🗃️ Database

- **Schema Management:** The database schema is managed entirely by [Flyway](https://flywaydb.org/). Migration scripts are located in `backend/src/main/resources/db/migration`.
- **Current Schema:** The database includes tables for users, items, orders, carts, and cart items with proper relationships and indexes.
- **Workflow for DB Changes:**
  1.  Create a new SQL file in the migration directory named `V<VERSION>__Description.sql` (e.g., `V2__Add_user_address.sql`).
  2.  Write your `ALTER TABLE`, `CREATE TABLE`, etc. statements.
  3.  Restart the application (`docker compose up -d db` or your Java app). Flyway will automatically apply the new migration.

---

### 🚨 Common Issues

- **Port Conflicts:** If you have another service running on `8080`, `5173`, or `5432`, the application may fail to start. Stop the conflicting service or change the port mappings in `docker-compose.yml` and `application.properties`.
- **Backend fails to connect to DB (Native):** Ensure your Docker `db` container is running before you start the Java application. Run `docker ps` to verify.
- **Docker Compose Command:** Use `docker compose` (with space) instead of `docker-compose` (with hyphen) for newer Docker versions.
- **TypeScript Compilation Errors:** All frontend TypeScript issues have been resolved. The project uses proper type definitions and interfaces.

### 🎯 Recent Fixes & Improvements

- ✅ **Resolved Circular Dependencies:** Fixed complex circular dependency issues in Spring Security configuration
- ✅ **Updated JWT Implementation:** Migrated to the latest JWT API with proper token handling
- ✅ **Fixed TypeScript Errors:** Resolved all frontend compilation issues and property mismatches
- ✅ **Database Schema Alignment:** Updated entities to match database schema with proper relationships
- ✅ **Enhanced Security:** Implemented proper JWT authentication with role-based authorization
- ✅ **Improved Frontend:** Added proper TypeScript types and component interfaces
