#!/bin/bash

# Simple Database Refresh Script for Amazon Linux EC2
# Clears all data and re-seeds with fresh demo data

set -e

echo "🔄 Refreshing database with fresh demo data..."

# Check if we're in the project directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the project root directory."
    exit 1
fi

# Use sudo for Docker on EC2
DOCKER_CMD="sudo docker"

# Load database credentials from .env
if [ -f ".env" ]; then
    export $(grep -E '^POSTGRES_DB=|^POSTGRES_USER=' .env | xargs)
fi

DB_NAME="${POSTGRES_DB:-ecommerce}"
DB_USER="${POSTGRES_USER:-ecommerce_user}"

echo "📦 Stopping backend..."
$DOCKER_CMD compose stop backend

echo "🗑️  Clearing database..."
$DOCKER_CMD compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" <<EOF
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS sales_items CASCADE;
DROP TABLE IF EXISTS discount_codes CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS flyway_schema_history CASCADE;
EOF

echo "🔄 Restarting backend (will run migrations and seed data)..."
$DOCKER_CMD compose up -d backend

echo "⏳ Waiting for data to be seeded (30-60 seconds)..."
sleep 30

# Wait for seeding to complete
for i in {1..30}; do
    if $DOCKER_CMD compose logs backend 2>&1 | grep -q "✅ Seeded.*items"; then
        echo "✅ Database refreshed successfully!"
        $DOCKER_CMD compose logs backend 2>&1 | grep "✅ Seeded" | tail -5
        exit 0
    fi
    sleep 2
done

echo "✅ Backend restarted. Check logs with: sudo docker compose logs backend"
