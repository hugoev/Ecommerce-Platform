# E-Commerce Platform

A full-stack online shopping platform built with React, TypeScript, Spring Boot, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** (required)
- **Git** (to clone the repository)

### What is Docker?

Docker is like a "virtual computer" that runs inside your computer. It automatically:

- Downloads and installs all the software needed (Java, Node.js, PostgreSQL)
- Sets up the database with sample data
- Builds and runs the website and API
- Connects everything together

**Think of it as a "one-click setup" that handles all the complex installation for you!**

### System Requirements

- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **OS**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)

### Installing Docker

**Windows/macOS**: Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)

**Linux (Ubuntu/Debian)**:

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Step 1: Clone and Start

```bash
# Clone the repository (downloads the code to your computer)
git clone https://github.com/hugoev/Ecommerce-Platform.git
cd Ecommerce-Platform

# Create environment file (required for Docker)
# Copy the example environment file with proper JWT secret
# Linux/macOS:
cp .env.example .env
# Windows (PowerShell):
# Copy-Item .env.example .env
# Windows (Command Prompt):
# copy .env.example .env

# Start all services with Docker Compose
docker compose up --build
```

**What this command does:**

- `git clone` - Downloads the project code from GitHub to your computer
- `cd Ecommerce-Platform` - Moves you into the project folder
- `cp .env.example .env` - Copies the example environment file with default settings
- `docker compose up` - Starts all the services (database, backend, frontend)
- `--build` - Forces Docker to rebuild everything from scratch (like a fresh install)
- This will download and install everything needed automatically - no manual setup required!

### Step 2: Wait for Services to Start

**What's happening:** Docker is downloading and setting up everything needed to run the application.

The first run will take 2-5 minutes as Docker:

- Downloads the database (PostgreSQL)
- Downloads Java and builds the backend API
- Downloads Node.js and builds the frontend website
- Sets up all the connections between services

You'll see output like:

```
✅ Database: Starting PostgreSQL
✅ Backend: Building Spring Boot application
✅ Frontend: Building React application
✅ All services: Ready!
```

**Don't worry if it takes a while - this is normal for the first time!**

### Step 3: Access the Application

Once all containers are running, you can access:

- 🌐 **Frontend** (the website): http://localhost:5173
  - This is the main application you'll use in your browser
- 🔧 **Backend API** (the server): http://localhost:8080
  - This handles data and business logic (you won't use this directly)
- 🗄️ **Database** (data storage): PostgreSQL on localhost:5432
  - This stores all the application data (you won't use this directly)

**Just open your web browser and go to http://localhost:5173 to use the application!**

### Step 4: Login

**The application comes with pre-loaded sample data:**

- **10 sample products** across different categories (Electronics, Clothing, Books, Home & Garden, Sports)
- **4 users** ready to use
- **4 discount codes** for testing

**Default Admin Credentials:**

- Username: `admin`
- Password: `admin123`

**Test Users:**

- Username: `john_doe` / Password: `password123`
- Username: `jane_smith` / Password: `password123`
- Username: `bob_wilson` / Password: `password123`

**Sample Discount Codes:**

- `WELCOME10` - 10% off
- `SUMMER20` - 20% off
- `STUDENT15` - 15% off
- `EXPIRED5` - 5% off (expired for testing)

> 💡 **Note**: The application uses external image URLs for sample products. If you upload custom images, they will be stored in the `backend/uploads/images/` directory and persist between Docker restarts.

### Step 5: You're Ready!

🎉 **Congratulations!** You now have a fully functional e-commerce application running on your computer.

**What you can do:**

- Browse products as a customer
- Add items to cart and checkout
- Login as admin to manage products and users
- The application has sample data already loaded

**To stop the application:** Press `Ctrl+C` in the terminal where it's running
**To start it again:** Run `docker compose up --build` from the project folder

> 💡 **Tip**: If the frontend shows a blank page, wait a few more seconds for the backend to fully start up.

## 🆘 Common Issues for Beginners

### "Command not found" errors

- **Docker not installed**: Follow the installation steps in the Prerequisites section
- **Git not installed**: Download from [git-scm.com](https://git-scm.com/)

### "Port already in use" error

- Something else is using the same ports
- **Solution**: Close other applications or restart your computer

### Application won't start

- Make sure Docker Desktop is running (Windows/macOS)
- Try running `docker compose down` then `docker compose up --build` again

### Still having trouble?

- Check the detailed troubleshooting section below
- Make sure your computer meets the system requirements

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

### Option 1: Docker Compose (Production-like Testing)

**Best for:** Testing the full stack, deployment verification, or when you don't have Java/Node.js installed.

**Note:** This setup builds production images - code changes require rebuilding containers (2-5 minutes). Not ideal for rapid development.

```bash
# Start all services
docker compose up --build

# Run in background
docker compose up --build -d

# Stop services
docker compose down
```

**What happens:**

- Backend: Compiles Java → builds JAR → runs in container (no hot reload)
- Frontend: Builds static files → serves with Nginx (no hot reload)
- Database: PostgreSQL with persistent data

### Option 2: Local Development (Recommended for Fast Iteration)

**Best for:** Active development with instant feedback and hot reload.

**Benefits:**

- ⚡ **Instant frontend updates** - Vite HMR reloads changes in milliseconds
- 🔄 **Fast backend restarts** - Spring DevTools auto-restarts on code changes
- 🚀 **No rebuilds needed** - Edit code and see changes immediately

```bash
# 1. Start only the database in Docker
docker compose up -d db

# 2. Start Backend (Terminal 1)
cd backend
./mvnw spring-boot:run
# Backend runs on http://localhost:8080
# Changes auto-reload with Spring DevTools

# 3. Start Frontend (Terminal 2)
cd frontend
npm install  # Only needed first time
npm run dev
# Frontend runs on http://localhost:5173
# Changes hot-reload instantly with Vite
```

**Prerequisites for Local Development:**

- Java 17+
- Node.js 18+
- Maven (or use ./mvnw wrapper)
- Docker (only for the database)

**Workflow:**

1. Make code changes in your editor
2. Frontend: Changes appear instantly in browser (Vite HMR)
3. Backend: Spring DevTools restarts automatically (usually < 5 seconds)
4. No need to rebuild Docker containers!

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
- Regular users: `john_doe`, `jane_smith`, `bob_wilson` (all with password `password123`)
- 10 sample products across 5 categories
- 4 discount codes (WELCOME10, SUMMER20, STUDENT15, EXPIRED5)

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

### Deploy to EC2 (Recommended - One Command)

**For a fresh EC2 instance, use the complete deployment script:**

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Run the complete deployment script (handles everything automatically)
curl -fsSL https://raw.githubusercontent.com/hugoev/Ecommerce-Platform/main/deploy-complete.sh | bash
```

**What the script does:**
- ✅ Installs Docker and Docker Compose
- ✅ Detects your EC2 IP automatically
- ✅ Clones the repository
- ✅ Stops conflicting services (Apache/Nginx)
- ✅ Creates `.env` file with correct values
- ✅ Generates secure JWT secret (64+ chars for HS512)
- ✅ Sets correct `VITE_API_BASE_URL` (no trailing slash)
- ✅ Builds and starts all services
- ✅ Waits for services to be healthy
- ✅ Shows you access URLs and credentials

**Time:** 10-20 minutes on first run (depending on instance size)

**After deployment, access:**
- Frontend: `http://your-ec2-ip`
- Backend API: `http://your-ec2-ip:8080`
- API Docs: `http://your-ec2-ip:8080/swagger-ui.html`

### Manual EC2 Deployment

If you prefer manual setup, see `EC2_DEPLOYMENT_README.md` or `DEPLOY_TO_EC2.md` for detailed instructions.

Quick manual deploy:

```bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Clone and deploy
git clone https://github.com/hugoev/Ecommerce-Platform.git
cd Ecommerce-Platform

# Create .env file (see Environment Variables section below)
# Then deploy
docker compose up --build -d
```

### Environment Variables

**Note:** The `deploy-complete.sh` script automatically creates the `.env` file with correct values. For manual setup:

Create `.env` file in project root:

```bash
# For local development
cat > .env << EOF
POSTGRES_DB=ecommerce
POSTGRES_USER=ecommerce_user
POSTGRES_PASSWORD=your_secure_password

JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
JWT_EXPIRATION=86400

VITE_API_BASE_URL=http://localhost:8080
EOF
```

**For EC2 deployment**, the `.env` file should contain:

```env
# Database Configuration
POSTGRES_DB=ecommerce
POSTGRES_USER=ecommerce_user
POSTGRES_PASSWORD=your_secure_password

# JWT Configuration
# IMPORTANT: Must be at least 64 characters (512 bits) for HS512 algorithm
# Generate with: openssl rand -base64 64
JWT_SECRET=your_very_long_secret_key_at_least_64_characters_long
JWT_EXPIRATION=86400

# Frontend API Base URL
# IMPORTANT: Use your EC2 public IP, no trailing slash!
VITE_API_BASE_URL=http://YOUR-EC2-IP:8080
```

**Important Notes:**
- `JWT_SECRET` must be at least 64 characters (512 bits) for HS512 algorithm
- `VITE_API_BASE_URL` must NOT have a trailing slash
- For EC2, replace `YOUR-EC2-IP` with your actual EC2 public IP address

## 🐛 Troubleshooting

### Port Conflicts

If you get "port is already allocated" errors:

**macOS/Linux:**

```bash
# Check what's using the ports
lsof -i :5432 -i :8080 -i :5173

# Kill processes using these ports
sudo lsof -ti:5432 | xargs kill -9
sudo lsof -ti:8080 | xargs kill -9
sudo lsof -ti:5173 | xargs kill -9
```

**Windows (PowerShell):**

```powershell
# Check what's using the ports
netstat -ano | findstr :5432
netstat -ano | findstr :8080
netstat -ano | findstr :5173

# Kill processes (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Universal Solution:**

```bash
# Stop all Docker containers
docker stop $(docker ps -q)
```

### Docker Issues

```bash
# Clean rebuild (removes volumes and rebuilds)
docker compose down -v
docker compose up --build

# Check container status
docker compose ps

# View logs
docker compose logs backend
docker compose logs frontend
docker compose logs db
```

### Database Connection Issues

```bash
# Verify database is running
docker compose ps

# Check database logs
docker compose logs db

# Connect to database directly
docker compose exec db psql -U ecommerce_user -d ecommerce
```

### Frontend Can't Connect to Backend

- Ensure backend is running: `docker compose ps`
- Check backend logs: `docker compose logs backend`
- Verify CORS settings in `SecurityConfig.java`
- Check if `VITE_API_BASE_URL` environment variable is set

### Common Solutions

```bash
# Reset everything
docker compose down -v
docker system prune -f
docker compose up --build

# Check if all services are healthy
curl http://localhost:8080/api/items
curl http://localhost:5173
```

### Docker Not Installed?

If you don't have Docker installed:

1. **Windows**: Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)
2. **macOS**: Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)
3. **Linux**: Follow the installation commands in the Prerequisites section above

### Verification Steps

After running `docker compose up --build`, verify everything is working:

```bash
# 1. Check all containers are running
docker compose ps

# 2. Test backend API
curl http://localhost:8080/api/items

# 3. Test frontend
curl http://localhost:5173

# 4. Check logs if something's wrong
docker compose logs backend
docker compose logs frontend
```

### Still Having Issues?

1. Make sure Docker Desktop is running (Windows/macOS)
2. Try restarting Docker Desktop
3. Check if you have enough disk space (need ~2GB)
4. Ensure your system meets the minimum requirements

## 📄 Additional Documentation

- `backend/README.md` - Backend architecture and best practices
- `frontend/README.md` - Frontend structure and components
- `FRONTEND_API_GUIDE.md` - Detailed API integration guide
- `EC2_DEPLOYMENT_README.md` - AWS deployment guide (detailed)
- `DEPLOY_TO_EC2.md` - Quick EC2 deployment guide
- `deploy-complete.sh` - **Complete automated deployment script** (recommended)
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
