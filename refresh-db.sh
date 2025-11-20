#!/bin/bash

# Database Refresh Script for Ecommerce Platform
# This script clears all data and re-seeds the database with fresh demo data

set -e

echo "🔄 Refreshing database with fresh demo data..."
echo ""

# Check if we're in the project directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found. Please run this script from the project root directory."
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if containers are running
if ! docker ps | grep -q "ecommerce-db\|ecommerce-backend"; then
    echo "⚠️  Warning: Database or backend containers are not running."
    echo "   Starting services..."
    docker compose up -d db
    sleep 5
    docker compose up -d backend
    sleep 10
fi

echo "📦 Step 1/4: Stopping backend service..."
docker compose stop backend

echo "🗑️  Step 2/4: Clearing all data from database..."

# Load database credentials from .env file if it exists
if [ -f ".env" ]; then
    export $(grep -E '^POSTGRES_DB=|^POSTGRES_USER=|^POSTGRES_PASSWORD=' .env | xargs)
fi

# Use defaults if not set
DB_NAME="${POSTGRES_DB:-ecommerce}"
DB_USER="${POSTGRES_USER:-ecommerce_user}"

echo "   Using database: $DB_NAME, user: $DB_USER"

# Connect to database and drop all tables (this will be recreated by Flyway migrations)
docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" <<EOF
-- Disable foreign key checks temporarily
SET session_replication_role = 'replica';

-- Drop all tables in correct order to handle foreign keys
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS sales_items CASCADE;
DROP TABLE IF EXISTS discount_codes CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

-- Drop Flyway schema history to allow migrations to run again
DROP TABLE IF EXISTS flyway_schema_history CASCADE;

EOF

echo "✅ Database cleared successfully"

echo "🔄 Step 3/4: Restarting backend service (will run migrations and seed data)..."
docker compose up -d backend

echo "⏳ Step 4/4: Waiting for backend to initialize and seed data..."
echo "   This may take 30-60 seconds..."

# Wait for backend to be healthy and seed data
MAX_WAIT=120
WAIT_COUNT=0
while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
    if docker compose logs backend 2>&1 | grep -q "✅ Seeded.*items\|Started SpringBackendApplication"; then
        if docker compose logs backend 2>&1 | grep -q "✅ Seeded.*items"; then
            echo "✅ Backend started and data seeded successfully!"
            break
        fi
    fi
    sleep 2
    WAIT_COUNT=$((WAIT_COUNT + 2))
    echo -n "."
done

echo ""
echo ""

# Check if seeding was successful
if docker compose logs backend 2>&1 | grep -q "✅ Seeded.*items"; then
    echo "✅ Database refresh completed successfully!"
    echo ""
    echo "📊 Seeded data:"
    docker compose logs backend 2>&1 | grep "✅ Seeded" | tail -5
    echo ""
    echo "🌐 Your application is ready with fresh demo data!"
else
    echo "⚠️  Warning: Backend may still be starting. Check logs with:"
    echo "   docker compose logs backend"
fi

