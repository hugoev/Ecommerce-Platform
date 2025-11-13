#!/bin/bash

# Script to fix VITE_API_BASE_URL and rebuild frontend
# Run this on your EC2 instance

set -e

echo "🔧 Fixing VITE_API_BASE_URL and rebuilding frontend..."

# Get EC2 public IP
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "📍 Detected EC2 IP: $EC2_IP"

# Navigate to project directory
cd ~/Ecommerce-Platform || cd /home/ubuntu/Ecommerce-Platform

# Update .env file
if [ -f ".env" ]; then
    echo "📝 Updating .env file..."
    # Remove old VITE_API_BASE_URL line if it exists
    sed -i '/^VITE_API_BASE_URL=/d' .env
    # Add new VITE_API_BASE_URL
    echo "VITE_API_BASE_URL=http://$EC2_IP:8080" >> .env
    echo "✅ Updated VITE_API_BASE_URL to: http://$EC2_IP:8080"
else
    echo "❌ .env file not found!"
    exit 1
fi

# Verify the update
echo ""
echo "📋 Current .env VITE_API_BASE_URL:"
grep VITE_API_BASE_URL .env || echo "⚠️  VITE_API_BASE_URL not found in .env"

# Rebuild frontend (this is critical - Vite variables are build-time)
echo ""
echo "🔨 Rebuilding frontend with new API URL..."
echo "⏳ This will take 2-5 minutes..."

# Use sudo if needed, or regular docker compose
if docker info &> /dev/null; then
    docker compose up -d --build frontend
else
    echo "⚠️  Using sudo for Docker commands..."
    sudo docker compose up -d --build frontend
fi

echo ""
echo "✅ Frontend rebuild complete!"
echo ""
echo "🌐 Your frontend should now connect to: http://$EC2_IP:8080"
echo ""
echo "📝 Next steps:"
echo "   1. Wait 1-2 minutes for the build to complete"
echo "   2. Check logs: docker compose logs frontend --tail=20"
echo "   3. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)"
echo "   4. Clear browser cache if needed"

