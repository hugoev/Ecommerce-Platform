#!/bin/bash

# Amazon Linux 2023 Deployment Script for Ecommerce Platform
# Optimized for Amazon Linux 2023 (handles curl-minimal package conflict)
# Run this on a fresh Amazon Linux EC2 instance: bash deploy-amazon-linux.sh

set -e

echo "🚀 Ecommerce Platform - Amazon Linux 2023 Deployment"
echo "====================================================="
echo ""

# Verify we're on Amazon Linux
if ! command -v yum &> /dev/null; then
    echo "❌ This script is designed for Amazon Linux / RHEL systems."
    echo "   For Ubuntu/Debian, use: deploy-complete.sh"
    exit 1
fi

echo "📍 Detected: Amazon Linux / RHEL"
echo ""

# Update system packages
echo "📦 Step 1/10: Updating system packages..."
sudo yum update -y

# Install required packages (skip curl - curl-minimal is already installed and works fine)
echo "📦 Installing required packages (git, wget)..."
sudo yum install -y git wget openssl

# Verify curl-minimal works (it should be installed by default)
if ! command -v curl &> /dev/null; then
    echo "⚠️  curl-minimal not found, installing curl..."
    sudo yum install -y curl --allowerasing || sudo yum install -y curl-minimal
else
    echo "✅ curl is available (curl-minimal)"
fi

# Install Docker
echo ""
echo "🐳 Step 2/10: Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo systemctl start docker
    sudo systemctl enable docker
    
    # Add user to docker group (works for both ec2-user and ubuntu)
    if id "ec2-user" &>/dev/null; then
        sudo usermod -aG docker ec2-user
        DOCKER_USER="ec2-user"
    elif id "ubuntu" &>/dev/null; then
        sudo usermod -aG docker ubuntu
        DOCKER_USER="ubuntu"
    else
        sudo usermod -aG docker $USER
        DOCKER_USER=$USER
    fi
    
    # Verify Docker installation
    if sudo docker --version &> /dev/null; then
        echo "✅ Docker installed successfully"
    else
        echo "❌ Docker installation failed"
        exit 1
    fi
    
    echo "⚠️  Note: Docker group changes require logging out/in or using 'newgrp docker'"
    echo "   If you get permission errors, use: sudo docker <command>"
else
    echo "✅ Docker is already installed"
    DOCKER_USER=$USER
fi

# Install Docker Compose
echo ""
echo "🐳 Step 3/10: Installing Docker Compose..."
USE_DOCKER_COMPOSE_PLUGIN=false
if docker compose version &> /dev/null 2>&1; then
    USE_DOCKER_COMPOSE_PLUGIN=true
    echo "✅ Docker Compose plugin found"
elif command -v docker-compose &> /dev/null; then
    USE_DOCKER_COMPOSE_PLUGIN=false
    echo "✅ Docker Compose standalone found"
else
    echo "📥 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    if docker-compose --version &> /dev/null; then
        echo "✅ Docker Compose installed successfully"
        USE_DOCKER_COMPOSE_PLUGIN=false
    else
        echo "❌ Docker Compose installation failed"
        exit 1
    fi
fi

# Function to run docker compose commands (handles both plugin and standalone)
docker_compose() {
    if docker info &> /dev/null 2>&1; then
        if [ "$USE_DOCKER_COMPOSE_PLUGIN" = true ]; then
            docker compose "$@"
        else
            docker-compose "$@"
        fi
    else
        if [ "$USE_DOCKER_COMPOSE_PLUGIN" = true ]; then
            sudo docker compose "$@"
        else
            sudo docker-compose "$@"
        fi
    fi
}

# Get EC2 public IP
echo ""
echo "📍 Step 4/10: Detecting EC2 IP address..."
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || echo "localhost")
if [ "$EC2_IP" = "localhost" ]; then
    echo "⚠️  Could not detect EC2 IP. You may need to set it manually."
    read -p "Enter your EC2 public IP (or press Enter to use localhost): " MANUAL_IP
    EC2_IP=${MANUAL_IP:-localhost}
fi
echo "✅ EC2 IP: $EC2_IP"

# Clone repository
echo ""
echo "📥 Step 5/10: Cloning repository..."
if [ -d "Ecommerce-Platform" ]; then
    echo "📁 Found existing Ecommerce-Platform directory"
    PROJECT_DIR="Ecommerce-Platform"
elif [ -f "docker-compose.yml" ]; then
    echo "📁 Already in project directory"
    PROJECT_DIR="."
else
    echo "📥 Cloning from GitHub..."
    git clone https://github.com/hugoev/Ecommerce-Platform.git || {
        echo "❌ Failed to clone repository. Check your internet connection."
        exit 1
    }
    PROJECT_DIR="Ecommerce-Platform"
fi

cd "$PROJECT_DIR" || {
    echo "❌ Failed to change to project directory"
    exit 1
}

# Stop any existing services
echo ""
echo "🛑 Step 6/10: Stopping existing services and freeing ports..."
docker_compose down 2>/dev/null || true

# Check and stop port conflicts
echo "🔍 Checking for port conflicts..."
PORT_80_IN_USE=false
PORT_8080_IN_USE=false

# Check for port conflicts (Amazon Linux uses different tools)
if command -v lsof &> /dev/null; then
    if sudo lsof -i :80 &> /dev/null 2>&1; then
        PORT_80_IN_USE=true
    fi
    if sudo lsof -i :8080 &> /dev/null 2>&1; then
        PORT_8080_IN_USE=true
    fi
elif command -v netstat &> /dev/null; then
    if sudo netstat -tuln | grep -q ":80 " 2>/dev/null; then
        PORT_80_IN_USE=true
    fi
    if sudo netstat -tuln | grep -q ":8080 " 2>/dev/null; then
        PORT_8080_IN_USE=true
    fi
fi

if [ "$PORT_80_IN_USE" = true ] || [ "$PORT_8080_IN_USE" = true ]; then
    echo "⚠️  Ports 80 or 8080 are in use. Stopping common web servers..."
    
    # Stop Apache (httpd on Amazon Linux)
    if systemctl is-active --quiet httpd 2>/dev/null || systemctl is-active --quiet apache2 2>/dev/null; then
        echo "   Stopping Apache/httpd..."
        sudo systemctl stop httpd 2>/dev/null || sudo systemctl stop apache2 2>/dev/null
        sudo systemctl disable httpd 2>/dev/null || sudo systemctl disable apache2 2>/dev/null
    fi
    
    # Stop Nginx
    if systemctl is-active --quiet nginx 2>/dev/null; then
        echo "   Stopping Nginx..."
        sudo systemctl stop nginx
        sudo systemctl disable nginx
    fi
    
    sleep 2
    echo "✅ Ports should now be free"
fi

# Create/update .env file
echo ""
echo "📝 Step 7/10: Creating/updating .env file..."

# Generate secure passwords (preserve existing if present)
if [ -f ".env" ] && grep -q "^POSTGRES_PASSWORD=" .env; then
    DB_PASSWORD=$(grep "^POSTGRES_PASSWORD=" .env | cut -d'=' -f2)
    echo "   Using existing database password"
else
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    echo "   Generated new database password"
fi

# Generate JWT secret (ensure it's 64+ characters for HS512)
if [ -f ".env" ] && grep -q "^JWT_SECRET=" .env; then
    EXISTING_JWT=$(grep "^JWT_SECRET=" .env | cut -d'=' -f2)
    if [ ${#EXISTING_JWT} -ge 64 ]; then
        JWT_SECRET=$EXISTING_JWT
        echo "   Using existing JWT secret (${#JWT_SECRET} chars)"
    else
        echo "   Existing JWT secret too short (${#EXISTING_JWT} chars), generating new one..."
        JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
        if [ ${#JWT_SECRET} -lt 64 ]; then
            JWT_SECRET=$(openssl rand -hex 64)
        fi
    fi
else
    # Generate 64 bytes (512 bits) for HS512 - base64 gives ~88 chars
    JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
    if [ ${#JWT_SECRET} -lt 64 ]; then
        JWT_SECRET=$(openssl rand -hex 64)
    fi
    echo "   Generated new JWT secret (${#JWT_SECRET} chars)"
fi

# Always update VITE_API_BASE_URL with current EC2 IP
sed -i '/^VITE_API_BASE_URL=/d' .env 2>/dev/null || true

# Create/update .env file
cat > .env << EOF
# Database Configuration
POSTGRES_DB=ecommerce
POSTGRES_USER=ecommerce_user
POSTGRES_PASSWORD=$DB_PASSWORD

# JWT Configuration (must be >= 64 chars for HS512)
JWT_SECRET=$JWT_SECRET
JWT_EXPIRATION=86400

# Frontend API Base URL (no trailing slash!)
VITE_API_BASE_URL=http://$EC2_IP:8080
EOF

echo "✅ .env file created/updated"
echo "   VITE_API_BASE_URL=http://$EC2_IP:8080"
echo "   JWT_SECRET length: ${#JWT_SECRET} characters"

# Create uploads directory
echo ""
echo "📁 Step 8/10: Creating required directories..."
mkdir -p backend/uploads/images
chmod 755 backend/uploads backend/uploads/images
echo "✅ Directories created"

# Build and start services
echo ""
echo "🔨 Step 9/10: Building and starting services..."
echo "⏳ This will take 5-15 minutes on first run..."
echo ""

# Verify .env one more time
if ! grep -q "^VITE_API_BASE_URL=http://$EC2_IP:8080$" .env; then
    echo "⚠️  Fixing VITE_API_BASE_URL..."
    sed -i '/^VITE_API_BASE_URL=/d' .env
    echo "VITE_API_BASE_URL=http://$EC2_IP:8080" >> .env
fi

# Build and start
docker_compose up --build -d || {
    echo ""
    echo "❌ Failed to start services."
    echo ""
    echo "Troubleshooting:"
    echo "1. Check logs: docker_compose logs"
    echo "2. Check ports: sudo lsof -i :80 -i :8080"
    echo "3. Check Docker: sudo docker ps -a"
    echo "4. Docker permission errors? Try: newgrp docker"
    exit 1
}

# Wait for services
echo ""
echo "⏳ Step 10/10: Waiting for services to be ready..."
MAX_WAIT=180
WAIT_TIME=0
SLEEP_INTERVAL=5

echo "   Waiting for containers to start..."
while [ $WAIT_TIME -lt $MAX_WAIT ]; do
    if docker_compose ps 2>/dev/null | grep -q "Up"; then
        echo "   ✅ Containers are running"
        break
    fi
    sleep $SLEEP_INTERVAL
    WAIT_TIME=$((WAIT_TIME + SLEEP_INTERVAL))
    if [ $((WAIT_TIME % 15)) -eq 0 ]; then
        echo "   Still waiting... ($WAIT_TIME/$MAX_WAIT seconds)"
    fi
done

# Check service status
echo ""
echo "🔍 Checking service status..."
docker_compose ps

# Wait for backend to be healthy
echo ""
echo "⏳ Waiting for backend API to be ready..."
MAX_BACKEND_WAIT=240
BACKEND_WAIT=0

while [ $BACKEND_WAIT -lt $MAX_BACKEND_WAIT ]; do
    if curl -f -s http://localhost:8080/api/items > /dev/null 2>&1; then
        echo "   ✅ Backend is responding"
        break
    fi
    sleep $SLEEP_INTERVAL
    BACKEND_WAIT=$((BACKEND_WAIT + SLEEP_INTERVAL))
    if [ $((BACKEND_WAIT % 20)) -eq 0 ]; then
        echo "   Still waiting for backend... ($BACKEND_WAIT/$MAX_BACKEND_WAIT seconds)"
    fi
done

if [ $BACKEND_WAIT -ge $MAX_BACKEND_WAIT ]; then
    echo "   ⚠️  Backend may still be starting. This is normal on slower instances."
    echo "   Check logs: docker_compose logs backend"
fi

# Final status
echo ""
echo "================================================"
echo "✅ Deployment Complete!"
echo "================================================"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend:  http://$EC2_IP"
echo "   Backend:   http://$EC2_IP:8080"
echo "   API Docs:  http://$EC2_IP:8080/swagger-ui.html"
echo ""
echo "🔐 Default Login Credentials:"
echo "   Admin: admin / admin123"
echo "   User:  john_doe / password123"
echo "   ⚠️  CHANGE THESE PASSWORDS IMMEDIATELY!"
echo ""
echo "📋 Service Status:"
docker_compose ps
echo ""
echo "🔧 Useful Commands:"
if [ "$USE_DOCKER_COMPOSE_PLUGIN" = true ]; then
    echo "   View logs:    docker compose logs -f"
    echo "   Restart:      docker compose restart"
    echo "   Stop:         docker compose down"
    echo "   Update:       git pull && docker compose up --build -d"
else
    echo "   View logs:    docker-compose logs -f"
    echo "   Restart:      docker-compose restart"
    echo "   Stop:         docker-compose down"
    echo "   Update:       git pull && docker-compose up --build -d"
fi
echo ""
echo "📝 Troubleshooting:"
echo "   - Can't access? Check Security Group allows ports 80 and 8080"
echo "   - Services not starting? Check: docker_compose logs"
echo "   - Docker permission errors? Use: newgrp docker (or sudo docker <command>)"
echo ""
echo "🎉 Your ecommerce platform is now deployed!"

