#!/bin/bash

# Ecommerce Platform EC2 Deployment Script
# This script sets up the full-stack application on an EC2 instance using Docker

set -e

echo "🚀 Starting Ecommerce Platform Deployment..."

# Detect OS
if command -v yum &> /dev/null; then
    OS_TYPE="amazon"
    echo "📍 Detected: Amazon Linux / RHEL"
elif command -v apt &> /dev/null; then
    OS_TYPE="ubuntu"
    echo "📍 Detected: Ubuntu / Debian"
else
    echo "❌ Unsupported OS. This script supports Ubuntu/Debian and Amazon Linux."
    exit 1
fi

# Update system packages
echo "📦 Updating system packages..."
if [ "$OS_TYPE" = "amazon" ]; then
    sudo yum update -y
    sudo yum install -y git curl wget
else
    sudo apt update && sudo apt upgrade -y
    sudo apt install -y git curl wget
fi

# Install Docker (for containerized deployment)
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
    
    # Verify Docker installation
    if sudo docker --version &> /dev/null; then
        echo "✅ Docker installed successfully"
    else
        echo "❌ Docker installation failed"
        exit 1
    fi
    
    # Try to activate docker group without logging out
    echo "🔄 Activating docker group..."
    newgrp docker << EONG || true
echo "Docker group activated"
EONG
    
    echo "⚠️  Note: If you still get permission errors, try: newgrp docker"
    echo "   Or log out and back in: exit (then SSH back in)"
else
    echo "✅ Docker is already installed"
fi

# Install Docker Compose (check for both plugin and standalone versions)
echo "🐳 Checking Docker Compose..."
USE_DOCKER_COMPOSE_PLUGIN=false
if docker compose version &> /dev/null; then
    USE_DOCKER_COMPOSE_PLUGIN=true
    echo "✅ Docker Compose plugin found"
elif command -v docker-compose &> /dev/null; then
    USE_DOCKER_COMPOSE_PLUGIN=false
    echo "✅ Docker Compose standalone found"
else
    echo "📥 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    # Verify installation
    if docker-compose --version &> /dev/null; then
        echo "✅ Docker Compose installed successfully"
        USE_DOCKER_COMPOSE_PLUGIN=false
    else
        echo "❌ Docker Compose installation failed"
        exit 1
    fi
fi

# Function to run docker commands (with sudo fallback if needed)
docker_cmd() {
    if docker info &> /dev/null; then
        docker "$@"
    else
        echo "⚠️  Docker permission issue detected, using sudo..."
        sudo docker "$@"
    fi
}

# Function to run docker compose commands (with sudo fallback if needed)
docker_compose() {
    if docker info &> /dev/null; then
        if [ "$USE_DOCKER_COMPOSE_PLUGIN" = true ]; then
            docker compose "$@"
        else
            docker-compose "$@"
        fi
    else
        echo "⚠️  Docker permission issue detected, using sudo..."
        if [ "$USE_DOCKER_COMPOSE_PLUGIN" = true ]; then
            sudo docker compose "$@"
        else
            sudo docker-compose "$@"
        fi
    fi
}

# Get EC2 public IP
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || echo "localhost")
echo "📍 Detected EC2 IP: $EC2_IP"

# Determine project directory
if [ -d "Ecommerce-Platform" ]; then
    echo "📁 Found existing Ecommerce-Platform directory"
    PROJECT_DIR="Ecommerce-Platform"
elif [ -f "docker-compose.yml" ]; then
    echo "📁 Already in project directory"
    PROJECT_DIR="."
else
    echo "📥 Cloning repository..."
    git clone https://github.com/hugoev/Ecommerce-Platform.git || {
        echo "❌ Failed to clone repository. Check your internet connection and GitHub access."
        exit 1
    }
    PROJECT_DIR="Ecommerce-Platform"
fi

cd "$PROJECT_DIR" || {
    echo "❌ Failed to change to project directory"
    exit 1
}

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    
    # Generate secure passwords
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
    
    cat > .env << EOF
# Database Configuration
POSTGRES_DB=ecommerce
POSTGRES_USER=ecommerce_user
POSTGRES_PASSWORD=$DB_PASSWORD

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRATION=86400

# Frontend API Base URL
VITE_API_BASE_URL=http://$EC2_IP:8080
EOF
    
    echo "✅ .env file created with secure passwords"
else
    echo "ℹ️  .env file already exists, skipping creation"
    echo "⚠️  Make sure VITE_API_BASE_URL is set to: http://$EC2_IP:8080"
fi

# Create uploads directory for images
echo "📁 Creating uploads directory..."
mkdir -p backend/uploads/images
chmod 755 backend/uploads
chmod 755 backend/uploads/images

# Check for port conflicts
echo "🔍 Checking for port conflicts..."
PORT_80_IN_USE=false
PORT_8080_IN_USE=false

if command -v lsof &> /dev/null; then
    if sudo lsof -i :80 &> /dev/null; then
        PORT_80_IN_USE=true
        echo "⚠️  Port 80 is already in use"
        sudo lsof -i :80 | head -3
    fi
    if sudo lsof -i :8080 &> /dev/null; then
        PORT_8080_IN_USE=true
        echo "⚠️  Port 8080 is already in use"
        sudo lsof -i :8080 | head -3
    fi
elif command -v netstat &> /dev/null; then
    if sudo netstat -tuln | grep -q ":80 "; then
        PORT_80_IN_USE=true
        echo "⚠️  Port 80 is already in use"
    fi
    if sudo netstat -tuln | grep -q ":8080 "; then
        PORT_8080_IN_USE=true
        echo "⚠️  Port 8080 is already in use"
    fi
fi

if [ "$PORT_80_IN_USE" = true ] || [ "$PORT_8080_IN_USE" = true ]; then
    echo ""
    echo "🔧 Attempting to stop common services that might be using these ports..."
    
    # Try to stop Apache
    if systemctl is-active --quiet apache2 2>/dev/null || systemctl is-active --quiet httpd 2>/dev/null; then
        echo "   Stopping Apache..."
        sudo systemctl stop apache2 2>/dev/null || sudo systemctl stop httpd 2>/dev/null
        sudo systemctl disable apache2 2>/dev/null || sudo systemctl disable httpd 2>/dev/null
    fi
    
    # Try to stop Nginx
    if systemctl is-active --quiet nginx 2>/dev/null; then
        echo "   Stopping Nginx..."
        sudo systemctl stop nginx
        sudo systemctl disable nginx
    fi
    
    # Wait a moment for ports to be released
    sleep 2
    
    echo "✅ Common web servers stopped. If ports are still in use, you may need to:"
    echo "   1. Identify the process: sudo lsof -i :80 or sudo netstat -tulpn | grep :80"
    echo "   2. Stop it manually or change the port in docker-compose.yml"
    echo ""
fi

# Build and start the application using Docker Compose
echo "🔨 Building and starting application..."
echo "⏳ This may take 5-10 minutes on first run..."

# Build and start services
docker_compose up --build -d || {
    echo ""
    echo "❌ Failed to start services."
    echo ""
    echo "Common issues and solutions:"
    echo "1. Port 80 in use:"
    echo "   - Stop Apache: sudo systemctl stop apache2 (or httpd)"
    echo "   - Stop Nginx: sudo systemctl stop nginx"
    echo "   - Or find the process: sudo lsof -i :80"
    echo ""
    echo "2. Port 8080 in use:"
    echo "   - Find the process: sudo lsof -i :8080"
    echo "   - Kill it: sudo kill -9 <PID>"
    echo ""
    echo "3. Check logs:"
    if [ "$USE_DOCKER_COMPOSE_PLUGIN" = true ]; then
        echo "   docker compose logs"
    else
        echo "   docker-compose logs"
    fi
    exit 1
}

# Wait for services to be ready with health checks
echo "⏳ Waiting for services to start..."
MAX_WAIT=120
WAIT_TIME=0
SLEEP_INTERVAL=5

while [ $WAIT_TIME -lt $MAX_WAIT ]; do
    if docker_compose ps | grep -q "Up"; then
        echo "✅ Services are starting..."
        break
    fi
    sleep $SLEEP_INTERVAL
    WAIT_TIME=$((WAIT_TIME + SLEEP_INTERVAL))
    echo "   Waiting... ($WAIT_TIME/$MAX_WAIT seconds)"
done

# Check if services are running
echo "🔍 Checking service status..."
docker_compose ps

# Wait for backend to be healthy
echo "⏳ Waiting for backend to be ready..."
MAX_BACKEND_WAIT=180
BACKEND_WAIT=0

while [ $BACKEND_WAIT -lt $MAX_BACKEND_WAIT ]; do
    if curl -f -s http://localhost:8080/api/items > /dev/null 2>&1; then
        echo "✅ Backend is responding"
        break
    fi
    sleep $SLEEP_INTERVAL
    BACKEND_WAIT=$((BACKEND_WAIT + SLEEP_INTERVAL))
    if [ $((BACKEND_WAIT % 15)) -eq 0 ]; then
        echo "   Still waiting for backend... ($BACKEND_WAIT/$MAX_BACKEND_WAIT seconds)"
    fi
done

if [ $BACKEND_WAIT -ge $MAX_BACKEND_WAIT ]; then
    echo "⚠️  Backend may still be starting. Check logs with: docker_compose logs backend"
    echo "   This is normal on slower instances - the backend may need more time"
fi

echo ""
echo "✅ Deployment completed!"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://$EC2_IP"
echo "   Backend API: http://$EC2_IP:8080"
echo "   API Documentation: http://$EC2_IP:8080/swagger-ui.html"
echo ""
echo "🔐 Default Login Credentials:"
echo "   Admin: admin / admin123"
echo "   User: john_doe / password123"
echo "   ⚠️  CHANGE THESE PASSWORDS IMMEDIATELY!"
echo ""
echo "📁 Images are stored in: backend/uploads/images/"
echo ""
echo "🔧 Useful commands:"
if [ "$USE_DOCKER_COMPOSE_PLUGIN" = true ]; then
    echo "   View logs: docker compose logs -f"
    echo "   View backend logs: docker compose logs -f backend"
    echo "   Restart services: docker compose restart"
    echo "   Stop services: docker compose down"
    echo "   Update code: git pull && docker compose up --build -d"
else
    echo "   View logs: docker-compose logs -f"
    echo "   View backend logs: docker-compose logs -f backend"
    echo "   Restart services: docker-compose restart"
    echo "   Stop services: docker-compose down"
    echo "   Update code: git pull && docker-compose up --build -d"
fi
echo ""
echo "📝 Troubleshooting:"
if [ "$USE_DOCKER_COMPOSE_PLUGIN" = true ]; then
    echo "   If services won't start: docker compose logs"
else
    echo "   If services won't start: docker-compose logs"
fi
echo "   If can't access from internet: Check Security Group allows ports 80 and 8080"
echo "   If Docker permission errors: newgrp docker (or log out and back in)"

