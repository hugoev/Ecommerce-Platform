# E-Commerce Platform

A full-stack online shopping platform built with React, TypeScript, Spring Boot, and PostgreSQL.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/hugoev/Ecommerce-Platform.git
cd Ecommerce-Platform

# Start all services with Docker Compose
docker compose up --build
```

**Access the application:**

- 🌐 **Frontend**: http://localhost:5173
- 🔧 **Backend API**: http://localhost:8080
- 🗄️ **Database**: PostgreSQL on localhost:5432

**Default Admin Credentials:**

- Username: `admin`
- Password: `admin123`

## 📋 Features

### User Features

- ✅ User registration and authentication (JWT)
- ✅ Browse and search products
- ✅ Filter and sort by price/availability
- ✅ Shopping cart with quantity management
- ✅ Apply discount codes
- ✅ Automatic tax calculation (8.25%)
- ✅ Order placement and history
- ✅ Profile management

### Admin Features

- ✅ Product management (CRUD operations)
- ✅ Image upload for products
- ✅ User management dashboard
- ✅ Order tracking and status updates
- ✅ Create discount codes
- ✅ View sales analytics

## 🛠️ Technology Stack

**Frontend:**

- React 19 with TypeScript
- Vite for fast development
- Tailwind CSS + shadcn/ui components
- Redux Toolkit for state management
- Axios for API calls

**Backend:**

- Spring Boot 3.5.6 with Java 17
- Spring Security + JWT authentication
- JPA/Hibernate for ORM
- Flyway for database migrations
- BCrypt for password hashing

**Database:**

- PostgreSQL 15 (production)
- H2 (local development fallback)

**DevOps:**

- Docker & Docker Compose
- Nginx for frontend serving
- Multi-stage builds for optimization

## 📁 Project Structure

```
Ecommerce-Platform/
├── backend/                    # Spring Boot API
│   ├── src/main/java/
│   │   └── com/group7/ecommerce/springbackend/
│   │       ├── api/           # Admin controllers
│   │       ├── cart/          # Shopping cart logic
│   │       ├── item/          # Product management
│   │       ├── order/         # Order processing
│   │       ├── user/          # User management
│   │       └── security/      # JWT & authentication
│   └── src/main/resources/
│       ├── application.properties
│       └── db/migration/      # Flyway SQL migrations
│
├── frontend/                  # React TypeScript SPA
│   ├── src/
│   │   ├── api/              # API service layer
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Application pages
│   │   ├── hooks/            # Custom React hooks
│   │   ├── app/              # Redux store & slices
│   │   └── types/            # TypeScript definitions
│   └── package.json
│
├── docker-compose.yml         # Container orchestration
└── README.md
```

## 🔧 Development Setup

### Prerequisites

- Docker & Docker Compose
- (Optional) Java 17, Node.js 18+, PostgreSQL 15

### Option 1: Docker (Recommended)

```bash
docker compose up --build
```

Everything runs in containers - frontend, backend, and database.

### Option 2: Local Development

```bash
# 1. Start PostgreSQL
docker compose up -d db

# 2. Start Backend (Terminal 1)
cd backend
./mvnw spring-boot:run

# 3. Start Frontend (Terminal 2)
cd frontend
npm install
npm run dev
```

## 🔐 API Endpoints

### Public Endpoints (No Auth Required)

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login (returns JWT token)
- `GET /api/items` - Browse products (with search, sort, pagination)
- `GET /api/items/{id}` - Get single product

### User Endpoints (JWT Required)

- `GET /api/auth/profile/{id}` - Get user profile
- `PUT /api/auth/profile/{id}` - Update profile
- `POST /api/auth/change-password/{id}` - Change password
- `GET /api/cart/{userId}` - Get shopping cart
- `GET /api/cart/{userId}/summary` - Get cart with totals
- `POST /api/cart/{userId}/items/{itemId}` - Add to cart
- `PUT /api/cart/{userId}/items/{itemId}` - Update quantity
- `DELETE /api/cart/{userId}/items/{itemId}` - Remove from cart
- `DELETE /api/cart/{userId}` - Clear cart
- `POST /api/cart/{userId}/discount` - Apply discount code
- `POST /api/orders/{userId}/place` - Place order
- `GET /api/orders/{userId}` - Get order history

### Admin Endpoints (Admin Role Required)

- `GET /api/admin/users` - List all users (paginated)
- `GET /api/admin/orders` - List all orders (paginated)
- `GET /api/orders/admin/all` - Get all orders
- `GET /api/orders/admin/status/{status}` - Filter by status
- `PUT /api/orders/{orderId}/status` - Update order status
- `POST /api/admin/items` - Create product
- `PUT /api/admin/items/{id}` - Update product
- `DELETE /api/admin/items/{id}` - Delete product
- `POST /api/items/upload-image` - Upload product image
- `POST /api/admin/discounts` - Create discount code

### API Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": [2025, 10, 11, 12, 30, 45, 123456789]
}
```

## 🗄️ Database

**Schema managed by Flyway migrations:**

- `V1__Initial_Schema.sql` - Creates tables: users, items, carts, cart_items, orders, order_items, discount_codes
- `V2__Make_Email_Optional.sql` - Makes email field optional

**Seeded Data** (from `DataInitializer.java`):

- Admin user: `admin` / `admin123`
- Regular user: `user` / `password`
- 10 sample products
- 3 discount codes

## 🧪 Testing

```bash
# Backend tests
cd backend
./mvnw test

# Frontend type checking
cd frontend
npm run build
npm run lint
```

## 🌐 Deployment

### Deploy to EC2

See `EC2_DEPLOYMENT_README.md` for full AWS deployment instructions.

Quick deploy:

```bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Clone and deploy
git clone https://github.com/hugoev/Ecommerce-Platform.git
cd Ecommerce-Platform
docker compose up --build -d
```

### Environment Variables

Create `.env` file in project root:

```env
POSTGRES_DB=ecommerce
POSTGRES_USER=ecommerce_user
POSTGRES_PASSWORD=ecommerce_password
JWT_SECRET=your-long-secure-secret-key-here
JWT_EXPIRATION=86400
```

## 🐛 Troubleshooting

**Port conflicts:**

```bash
# Check what's using port 8080
lsof -ti:8080 | xargs kill -9
```

**Database connection issues:**

```bash
# Verify database is running
docker compose ps

# Check database logs
docker compose logs db
```

**Frontend can't connect to backend:**

- Check CORS settings in `SecurityConfig.java`
- Verify `VITE_API_BASE_URL` environment variable

**Clean rebuild:**

```bash
docker compose down -v
docker compose up --build
```

## 📄 Additional Documentation

- `backend/README.md` - Backend architecture and best practices
- `frontend/README.md` - Frontend structure and components
- `FRONTEND_API_GUIDE.md` - Detailed API integration guide
- `EC2_DEPLOYMENT_README.md` - AWS deployment guide
- `INFO.md` - Original project requirements

## 👥 Team Members

**Group 7: The Devs**

- Hugo Villarreal
- Boyu Chen
- Ian Hankinson
- Gerald Lopez
- Oluwafunso Olugbemi
- Miguel Rodriguez

**Course:** CS 3773-001 Software Engineering  
**Institution:** The University of Texas at San Antonio  
**Date:** Fall 2025

## 📝 License

This project is for educational purposes as part of a university software engineering course.

---

**Need Help?** Check the troubleshooting section above or review the additional documentation files.
