#!/bin/bash

# Ecommerce Platform EC2 Deployment Script
# This script sets up the full-stack application on an EC2 instance

set -e

echo "🚀 Starting Ecommerce Platform Deployment..."

# Update system packages
echo "📦 Updating system packages..."
sudo yum update -y || sudo apt update -y

# Install required packages
echo "🔧 Installing required packages..."
if command -v yum &> /dev/null; then
    # Amazon Linux / RHEL
    sudo yum install -y git curl wget unzip
else
    # Ubuntu / Debian
    sudo apt install -y git curl wget unzip
fi

# Install Docker (for containerized deployment)
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
fi

# Install Docker Compose
echo "🐳 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Install Node.js and npm (for frontend build)
echo "📦 Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs || sudo yum install -y nodejs
fi

# Install Java (for Spring Boot backend)
echo "☕ Installing Java..."
if ! command -v java &> /dev/null; then
    if command -v yum &> /dev/null; then
        sudo yum install -y java-17-amazon-corretto-devel
    else
        sudo apt install -y openjdk-17-jdk
    fi
fi

# Install PostgreSQL
echo "🗄️ Installing PostgreSQL..."
if ! command -v psql &> /dev/null; then
    if command -v yum &> /dev/null; then
        sudo amazon-linux-extras install postgresql14 -y
        sudo yum install -y postgresql-server
    else
        sudo apt install -y postgresql postgresql-contrib
    fi

    # Start PostgreSQL service
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

# Create database and user
echo "🗄️ Setting up PostgreSQL database..."
sudo -u postgres psql -c "CREATE USER ecommerce_user WITH PASSWORD 'ecommerce_password';" || echo "User already exists"
sudo -u postgres psql -c "CREATE DATABASE ecommerce OWNER ecommerce_user;" || echo "Database already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ecommerce TO ecommerce_user;" || echo "Privileges already granted"

# Clone the repository (if not already present)
if [ ! -d "Ecommerce-Platform" ]; then
    echo "📥 Cloning repository..."
    git clone https://github.com/your-username/Ecommerce-Platform.git
fi

cd Ecommerce-Platform

# Create uploads directory for images
echo "📁 Creating uploads directory..."
mkdir -p backend/uploads/images
chmod 755 backend/uploads
chmod 755 backend/uploads/images

# Build and start the application using Docker Compose
echo "🔨 Building and starting application..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose exec backend ./mvnw flyway:migrate -Dflyway.configFiles=src/main/resources/application.properties

echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "   Backend API: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8080"
echo "   API Documentation: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8080/swagger-ui.html"
echo ""
echo "📁 Images are stored in: /app/backend/uploads/images/"
echo "📸 Image URLs will be: http://your-ec2-ip/images/filename.jpg"
echo ""
echo "🔧 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Restart services: docker-compose restart"
echo "   Stop services: docker-compose down"
echo "   Update code: git pull && docker-compose up --build -d"

