# E-Commerce Platform - Developer Quickstart Guide

A full-stack online shopping platform featuring a Java Spring Boot backend, React frontend, and PostgreSQL database.

---

### 🏗️ Architecture Overview

- **Backend (`/backend`):** A RESTful API built with Java 17 and the Spring Boot framework.
- **Frontend (`/frontend`):** A Single-Page Application (SPA) built with React, TypeScript, and Vite.
- **Database:** A PostgreSQL database, managed via Docker Compose for consistency across all environments.

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
docker-compose up -d db
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
# Ensure you have the .env file (see step 1 above)

# This single command builds and starts the db, backend, and frontend.
docker-compose up --build
```

---

### 🛠️ Backend Details

- **Tech Stack:**
  - Framework: Spring Boot 3
  - Language: Java 17
  - Database: PostgreSQL with Flyway for migrations
  - Security: Spring Security with JWT authentication
  - Build: Apache Maven

- **Key Features:**
  - RESTful API with structured DTOs.
  - Role-based authorization (USER, ADMIN).
  - Transactional services for data consistency (e.g., order placement).
  - Centralized exception handling.

- **Available Endpoints:**
  - `GET /api/items`: Public item catalog.
  - `POST /api/auth/register`: User registration.
  - `POST /api/orders`: User-only order placement.
  - `POST /api/admin/items`: Admin-only item creation.
  - *(See code for the full list)*

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
  - Styling: CSS

- **Key Features:**
  - Single-Page Application architecture.
  - Type-safe components and API calls.
  - Environment-aware API configuration.

- **Project Structure:**
  ```
  frontend/
  ├── src/
  │   ├── api/         # API service layer
  │   ├── components/  # Reusable UI components
  │   ├── pages/       # Application pages
  │   └── types/       # TypeScript type definitions
  ```

- **Available Scripts:**
  - `npm run dev`: Starts the development server with hot-reloading.
  - `npm run build`: Creates a production-ready build in the `/dist` folder.

---

### 🧪 Testing

- **Backend Unit & Integration Tests:**
  Run the tests using the Maven wrapper inside the running backend container or natively.
  ```bash
  # Via Docker
  docker-compose exec backend mvn test

  # Natively
  cd backend
  mvn test
  ```

---

### 🗃️ Database

- **Schema Management:** The database schema is managed entirely by [Flyway](https://flywaydb.org/). Migration scripts are located in `backend/src/main/resources/db/migration`.
- **Workflow for DB Changes:**
  1.  Create a new SQL file in the migration directory named `V<VERSION>__Description.sql` (e.g., `V2__Add_user_address.sql`).
  2.  Write your `ALTER TABLE`, `CREATE TABLE`, etc. statements.
  3.  Restart the application (`docker-compose up -d db` or your Java app). Flyway will automatically apply the new migration.

---

### 🚨 Common Issues

- **Port Conflicts:** If you have another service running on `8080`, `5173`, or `5432`, the application may fail to start. Stop the conflicting service or change the port mappings in `docker-compose.yml` and `application.properties`.
- **Backend fails to connect to DB (Native):** Ensure your Docker `db` container is running before you start the Java application. Run `docker ps` to verify.
