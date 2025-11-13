#!/bin/bash

# Quick script to update .env file with correct EC2 IP and rebuild frontend
# Run this on EC2 whenever you need to fix the API URL

set -e

cd ~/Ecommerce-Platform || cd /home/ubuntu/Ecommerce-Platform

# Get EC2 public IP
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "📍 EC2 IP: $EC2_IP"

# Check and fix JWT_SECRET if too short (needs >= 64 chars for HS512)
if grep -q "^JWT_SECRET=" .env; then
    JWT_SECRET=$(grep "^JWT_SECRET=" .env | cut -d'=' -f2)
    if [ ${#JWT_SECRET} -lt 64 ]; then
        echo "⚠️  JWT_SECRET is too short (${#JWT_SECRET} chars), generating new one..."
        # Generate 64 bytes (512 bits) for HS512
        NEW_JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n' | head -c 88)
        if [ ${#NEW_JWT_SECRET} -lt 64 ]; then
            NEW_JWT_SECRET=$(openssl rand -hex 64)
        fi
        sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$NEW_JWT_SECRET|" .env
        echo "✅ Generated new JWT_SECRET (${#NEW_JWT_SECRET} chars)"
    fi
fi

# Remove old VITE_API_BASE_URL
sed -i '/^VITE_API_BASE_URL=/d' .env

# Add correct one (no trailing slash)
echo "VITE_API_BASE_URL=http://$EC2_IP:8080" >> .env

# Verify
echo ""
echo "✅ Updated .env:"
cat .env | grep VITE_API_BASE_URL
echo ""
cat .env | grep JWT_SECRET | sed 's/\(.\{20\}\).*/\1.../' # Show first 20 chars only

# Rebuild frontend (required - Vite variables are build-time)
echo ""
echo "🔨 Rebuilding frontend..."
sudo docker compose stop frontend 2>/dev/null || true
sudo docker compose rm -f frontend 2>/dev/null || true
sudo docker compose build --no-cache frontend
sudo docker compose up -d frontend

echo ""
echo "✅ Done! Wait 2-3 minutes, then refresh browser."

