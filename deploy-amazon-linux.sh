#!/bin/bash

# Amazon Linux 2023 Deployment Script for Ecommerce Platform
# Optimized for Amazon Linux 2023 (handles curl-minimal package conflict)
# Safe to rerun - detects existing installations and skips completed steps
# Run this on a fresh Amazon Linux EC2 instance: bash deploy-amazon-linux.sh

# Don't exit on error - allow script to continue and show what failed
set +e

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

# Track what's been completed
STEP_COMPLETED=()

# Function to check if step was completed
step_completed() {
    local step=$1
    for completed in "${STEP_COMPLETED[@]}"; do
        if [ "$completed" = "$step" ]; then
            return 0
        fi
    done
    return 1
}

# Function to mark step as completed
mark_completed() {
    STEP_COMPLETED+=("$1")
}

# Update system packages
echo "📦 Step 1/10: Updating system packages..."
if ! step_completed "packages_updated"; then
    sudo yum update -y
    if [ $? -eq 0 ]; then
        mark_completed "packages_updated"
        echo "✅ System packages updated"
    else
        echo "⚠️  Package update had issues, but continuing..."
    fi
else
    echo "✅ System packages already updated (skipping)"
fi

# Install required packages (skip curl - curl-minimal is already installed and works fine)
echo "📦 Installing required packages (git, wget, openssl)..."
if ! step_completed "packages_installed"; then
    MISSING_PACKAGES=()
    command -v git &> /dev/null || MISSING_PACKAGES+=("git")
    command -v wget &> /dev/null || MISSING_PACKAGES+=("wget")
    command -v openssl &> /dev/null || MISSING_PACKAGES+=("openssl")
    
    if [ ${#MISSING_PACKAGES[@]} -gt 0 ]; then
        echo "   Installing missing packages: ${MISSING_PACKAGES[*]}"
        sudo yum install -y "${MISSING_PACKAGES[@]}"
        if [ $? -eq 0 ]; then
            mark_completed "packages_installed"
            echo "✅ Required packages installed"
        else
            echo "❌ Failed to install packages. Please fix and rerun."
            exit 1
        fi
    else
        echo "✅ All required packages already installed"
        mark_completed "packages_installed"
    fi
else
    echo "✅ Required packages already installed (skipping)"
fi

# Verify curl-minimal works (it should be installed by default)
if ! command -v curl &> /dev/null; then
    echo "⚠️  curl-minimal not found, installing curl..."
    sudo yum install -y curl --allowerasing || sudo yum install -y curl-minimal
    if [ $? -eq 0 ]; then
        echo "✅ curl installed"
    else
        echo "⚠️  curl installation had issues, but continuing..."
    fi
else
    echo "✅ curl is available (curl-minimal)"
fi

# Install Docker
echo ""
echo "🐳 Step 2/10: Installing Docker..."
if command -v docker &> /dev/null && sudo docker --version &> /dev/null; then
    echo "✅ Docker is already installed: $(sudo docker --version)"
    DOCKER_USER=$USER
    mark_completed "docker_installed"
elif ! step_completed "docker_installed"; then
    echo "📥 Installing Docker for Amazon Linux 2023..."
    
    # Check if Docker service exists but Docker command doesn't work
    if systemctl list-unit-files | grep -q docker.service; then
        echo "   Docker service found, starting it..."
        sudo systemctl start docker
        sudo systemctl enable docker
        if sudo docker --version &> /dev/null; then
            echo "✅ Docker is working"
            mark_completed "docker_installed"
        fi
    fi
    
    # If Docker still not working, install it
    if ! sudo docker --version &> /dev/null; then
        # Try installing from Amazon Linux repositories first
        echo "   Attempting to install Docker from Amazon Linux repositories..."
        if sudo yum install -y docker 2>/dev/null; then
            echo "✅ Docker installed from Amazon Linux repositories"
        else
            # If not available, add Docker's official repository
            echo "   Adding Docker's official repository..."
            if ! command -v yum-config-manager &> /dev/null; then
                sudo yum install -y yum-utils
            fi
            
            # Check if Docker repo already exists
            if [ ! -f /etc/yum.repos.d/docker-ce.repo ]; then
                sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo 2>/dev/null
            fi
            
            # Install Docker Engine
            echo "   Installing Docker Engine..."
            sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin 2>/dev/null
        fi
        
        # Ensure Docker Buildx is installed and up to date
        if ! docker buildx version &> /dev/null; then
            echo "   Installing/updating Docker Buildx..."
            # Install buildx plugin if not present
            if [ ! -f ~/.docker/cli-plugins/docker-buildx ]; then
                mkdir -p ~/.docker/cli-plugins
                curl -L "https://github.com/docker/buildx/releases/latest/download/buildx-v$(curl -s https://api.github.com/repos/docker/buildx/releases/latest | grep -oP '"tag_name": "\K[^"]*' | sed 's/v//').linux-$(uname -m)" -o ~/.docker/cli-plugins/docker-buildx
                chmod +x ~/.docker/cli-plugins/docker-buildx
            fi
            # Also install system-wide
            sudo mkdir -p /usr/local/lib/docker/cli-plugins
            sudo curl -L "https://github.com/docker/buildx/releases/latest/download/buildx-v$(curl -s https://api.github.com/repos/docker/buildx/releases/latest | grep -oP '"tag_name": "\K[^"]*' | sed 's/v//').linux-$(uname -m)" -o /usr/local/lib/docker/cli-plugins/docker-buildx
            sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-buildx
        fi
        
        # Start and enable Docker
        sudo systemctl start docker
        sudo systemctl enable docker
        
        # Verify Docker installation
        if sudo docker --version &> /dev/null; then
            echo "✅ Docker installed successfully: $(sudo docker --version)"
            mark_completed "docker_installed"
        else
            echo "❌ Docker installation failed"
            echo "   Troubleshooting:"
            echo "   1. Check if Docker service is running: sudo systemctl status docker"
            echo "   2. Try manual installation: sudo yum install -y docker"
            echo "   3. Check logs: sudo journalctl -u docker"
            exit 1
        fi
    fi
    
    # Add user to docker group (works for both ec2-user and ubuntu)
    if ! step_completed "docker_group"; then
        if id "ec2-user" &>/dev/null; then
            sudo usermod -aG docker ec2-user 2>/dev/null
            DOCKER_USER="ec2-user"
        elif id "ubuntu" &>/dev/null; then
            sudo usermod -aG docker ubuntu 2>/dev/null
            DOCKER_USER="ubuntu"
        else
            sudo usermod -aG docker $USER 2>/dev/null
            DOCKER_USER=$USER
        fi
        mark_completed "docker_group"
        echo "⚠️  Note: Docker group changes require logging out/in or using 'newgrp docker'"
        echo "   If you get permission errors, use: sudo docker <command>"
    fi
else
    echo "✅ Docker installation already completed (skipping)"
fi

# Install Docker Buildx (required for docker compose build)
echo ""
echo "🐳 Step 3a/10: Installing/verifying Docker Buildx..."
BUILDX_INSTALLED=false
if docker buildx version &> /dev/null 2>&1; then
    BUILDX_VER=$(docker buildx version 2>&1 | head -1)
    # Check if version is >= 0.17
    if echo "$BUILDX_VER" | grep -qE "v0\.(1[7-9]|[2-9][0-9])|v[1-9]"; then
        BUILDX_INSTALLED=true
        echo "✅ Docker Buildx already installed: $BUILDX_VER"
    fi
elif sudo docker buildx version &> /dev/null 2>&1; then
    BUILDX_VER=$(sudo docker buildx version 2>&1 | head -1)
    if echo "$BUILDX_VER" | grep -qE "v0\.(1[7-9]|[2-9][0-9])|v[1-9]"; then
        BUILDX_INSTALLED=true
        echo "✅ Docker Buildx already installed: $BUILDX_VER"
    fi
fi

if [ "$BUILDX_INSTALLED" = false ]; then
    echo "📥 Installing Docker Buildx..."
    
    # Try installing from package first (easiest)
    if sudo yum install -y docker-buildx-plugin 2>/dev/null; then
        echo "✅ Docker Buildx installed from package"
    else
        # Fallback: Install manually
        echo "   Installing Docker Buildx manually..."
        
        # Create plugin directories
        mkdir -p ~/.docker/cli-plugins
        sudo mkdir -p /usr/local/lib/docker/cli-plugins
        
        # Download latest buildx (use a known working version)
        ARCH=$(uname -m)
        [ "$ARCH" = "x86_64" ] && ARCH="amd64" || ARCH="arm64"
        
        BUILDX_URL="https://github.com/docker/buildx/releases/latest/download/buildx-linux-${ARCH}"
        
        # Install for current user
        curl -L "$BUILDX_URL" -o ~/.docker/cli-plugins/docker-buildx 2>/dev/null
        if [ $? -eq 0 ] && [ -f ~/.docker/cli-plugins/docker-buildx ]; then
            chmod +x ~/.docker/cli-plugins/docker-buildx
            echo "   Installed for current user"
        fi
        
        # Install system-wide (requires sudo)
        sudo curl -L "$BUILDX_URL" -o /usr/local/lib/docker/cli-plugins/docker-buildx 2>/dev/null
        if [ $? -eq 0 ] && [ -f /usr/local/lib/docker/cli-plugins/docker-buildx ]; then
            sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-buildx
            echo "   Installed system-wide"
        fi
    fi
    
    # Verify installation
    if docker buildx version &> /dev/null 2>&1 || sudo docker buildx version &> /dev/null 2>&1; then
        BUILDX_VER=$(docker buildx version 2>&1 | head -1 || sudo docker buildx version 2>&1 | head -1)
        echo "✅ Docker Buildx installed successfully: $BUILDX_VER"
    else
        echo "❌ Docker Buildx installation failed"
        echo "   Please install manually:"
        echo "   sudo yum install -y docker-buildx-plugin"
        echo "   OR:"
        echo "   mkdir -p ~/.docker/cli-plugins"
        echo "   curl -L https://github.com/docker/buildx/releases/latest/download/buildx-linux-amd64 -o ~/.docker/cli-plugins/docker-buildx"
        echo "   chmod +x ~/.docker/cli-plugins/docker-buildx"
        exit 1
    fi
fi

# Install Docker Compose
echo ""
echo "🐳 Step 3b/10: Installing Docker Compose..."
USE_DOCKER_COMPOSE_PLUGIN=false
if docker compose version &> /dev/null 2>&1; then
    USE_DOCKER_COMPOSE_PLUGIN=true
    echo "✅ Docker Compose plugin found: $(docker compose version 2>&1 | head -1)"
    mark_completed "docker_compose_installed"
elif command -v docker-compose &> /dev/null; then
    USE_DOCKER_COMPOSE_PLUGIN=false
    echo "✅ Docker Compose standalone found: $(docker-compose --version)"
    mark_completed "docker_compose_installed"
elif ! step_completed "docker_compose_installed"; then
    echo "📥 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    
    if [ $? -eq 0 ]; then
        sudo chmod +x /usr/local/bin/docker-compose
        
        if docker-compose --version &> /dev/null; then
            echo "✅ Docker Compose installed successfully: $(docker-compose --version)"
            USE_DOCKER_COMPOSE_PLUGIN=false
            mark_completed "docker_compose_installed"
        else
            echo "❌ Docker Compose installation failed"
            exit 1
        fi
    else
        echo "❌ Failed to download Docker Compose"
        exit 1
    fi
else
    echo "✅ Docker Compose already installed (skipping)"
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
EC2_IP=$(curl -s --max-time 5 http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "")

# Validate IP address format
if [ -z "$EC2_IP" ] || [ "$EC2_IP" = "localhost" ] || ! echo "$EC2_IP" | grep -qE '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$'; then
    echo "⚠️  Could not automatically detect EC2 IP address."
    echo "   This might happen if you're not on EC2 or metadata service is unavailable."
    
    # Try alternative method - check if we can get instance ID first
    INSTANCE_ID=$(curl -s --max-time 5 http://169.254.169.254/latest/meta-data/instance-id 2>/dev/null)
    if [ -n "$INSTANCE_ID" ]; then
        echo "   Detected EC2 instance ID: $INSTANCE_ID"
        echo "   Trying to get IP from instance metadata..."
        EC2_IP=$(curl -s --max-time 5 http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "")
    fi
    
    # If still empty, ask user (but only if we're in an interactive shell)
    if [ -z "$EC2_IP" ] || ! echo "$EC2_IP" | grep -qE '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$'; then
        if [ -t 0 ]; then
            # Interactive shell - prompt user
            echo ""
            echo "   Please enter your EC2 public IP address:"
            read -p "   EC2 Public IP: " MANUAL_IP
            while [ -z "$MANUAL_IP" ] || ! echo "$MANUAL_IP" | grep -qE '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$'; do
                echo "   ❌ Invalid IP address format. Please enter a valid IP (e.g., 54.123.45.67)"
                read -p "   EC2 Public IP: " MANUAL_IP
            done
            EC2_IP=$MANUAL_IP
        else
            # Non-interactive (piped script) - try to get from AWS CLI or fail
            echo ""
            echo "   ⚠️  Non-interactive mode detected. Trying alternative methods..."
            # Try AWS CLI if available
            if command -v aws &> /dev/null; then
                EC2_IP=$(aws ec2 describe-instances --instance-ids $(curl -s http://169.254.169.254/latest/meta-data/instance-id) --query 'Reservations[0].Instances[0].PublicIpAddress' --output text 2>/dev/null || echo "")
            fi
            
            # If still empty, fail with instructions
            if [ -z "$EC2_IP" ] || ! echo "$EC2_IP" | grep -qE '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$'; then
                echo "   ❌ Could not detect EC2 IP address automatically."
                echo "   Please run the script interactively or set EC2_IP environment variable:"
                echo "   EC2_IP=your-ip-here bash deploy-amazon-linux.sh"
                echo "   OR find your IP in AWS Console: EC2 > Instances > Your Instance > Public IPv4 address"
                exit 1
            fi
        fi
    fi
fi

# Final validation - don't proceed with empty IP
if [ -z "$EC2_IP" ] || ! echo "$EC2_IP" | grep -qE '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$'; then
    echo "❌ Invalid or empty EC2 IP address. Cannot proceed."
    exit 1
fi

echo "✅ EC2 IP: $EC2_IP"

# Clone repository
echo ""
echo "📥 Step 5/10: Cloning repository..."
if [ -d "Ecommerce-Platform" ]; then
    echo "📁 Found existing Ecommerce-Platform directory"
    PROJECT_DIR="Ecommerce-Platform"
    # Try to update if it's a git repo
    if [ -d "$PROJECT_DIR/.git" ]; then
        echo "   Updating repository..."
        cd "$PROJECT_DIR" && git pull 2>/dev/null && cd - > /dev/null || echo "   (Could not update, using existing code)"
    fi
    mark_completed "repo_cloned"
elif [ -f "docker-compose.yml" ]; then
    echo "📁 Already in project directory"
    PROJECT_DIR="."
    mark_completed "repo_cloned"
elif ! step_completed "repo_cloned"; then
    echo "📥 Cloning from GitHub..."
    git clone https://github.com/hugoev/Ecommerce-Platform.git
    if [ $? -eq 0 ]; then
        PROJECT_DIR="Ecommerce-Platform"
        mark_completed "repo_cloned"
        echo "✅ Repository cloned"
    else
        echo "❌ Failed to clone repository. Check your internet connection."
        exit 1
    fi
else
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
chmod 755 backend/uploads backend/uploads/images 2>/dev/null || true
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
echo "   Building and starting Docker containers..."
docker_compose up --build -d
BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -ne 0 ]; then
    echo ""
    echo "❌ Failed to start services (exit code: $BUILD_EXIT_CODE)"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check logs: docker_compose logs"
    echo "2. Check ports: sudo lsof -i :80 -i :8080"
    echo "3. Check Docker: sudo docker ps -a"
    echo "4. Docker permission errors? Try: newgrp docker"
    echo "5. Check Docker daemon: sudo systemctl status docker"
    echo ""
    echo "You can fix the issue and rerun this script - it will skip completed steps."
    exit 1
fi

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
echo "💡 Tip: You can rerun this script anytime - it will skip completed steps!"
echo ""
echo "🎉 Your ecommerce platform is now deployed!"
