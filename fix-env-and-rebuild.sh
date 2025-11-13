#!/bin/bash

# Script to fix VITE_API_BASE_URL on EC2 and rebuild frontend
# Run this on your EC2 instance

set -e

echo "🔧 Fixing VITE_API_BASE_URL and rebuilding frontend..."

cd ~/Ecommerce-Platform || cd /home/ubuntu/Ecommerce-Platform

# Get EC2 public IP
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "📍 Detected EC2 IP: $EC2_IP"

# Show current value
echo ""
echo "Current VITE_API_BASE_URL:"
grep VITE_API_BASE_URL .env || echo "⚠️  VITE_API_BASE_URL not found in .env"

# Remove ALL instances of VITE_API_BASE_URL (including any with wrong format)
sed -i '/VITE_API_BASE_URL/d' .env

# Add correct value (NO trailing slash, WITH IP address)
echo "VITE_API_BASE_URL=http://$EC2_IP:8080" >> .env

# Verify
echo ""
echo "✅ Updated .env file:"
cat .env | grep VITE_API_BASE_URL

# Verify it's correct format
if grep -q "VITE_API_BASE_URL=http://$EC2_IP:8080$" .env; then
    echo "✅ Format is correct!"
else
    echo "❌ Format is still wrong! Check the .env file manually."
    exit 1
fi

# Rebuild frontend (critical - Vite variables are build-time)
echo ""
echo "🔨 Rebuilding frontend with new API URL..."
echo "⏳ This will take 2-5 minutes..."

# Stop and remove old container
sudo docker compose stop frontend 2>/dev/null || true
sudo docker compose rm -f frontend 2>/dev/null || true

# Rebuild with no cache
sudo docker compose build --no-cache frontend

# Start it
sudo docker compose up -d frontend

echo ""
echo "✅ Frontend rebuild complete!"
echo ""
echo "📋 Check status:"
sudo docker compose ps frontend

echo ""
echo "📋 Frontend logs (last 20 lines):"
sudo docker compose logs frontend --tail=20

echo ""
echo "🌐 Your frontend should now connect to: http://$EC2_IP:8080"
echo ""
echo "📝 Next steps:"
echo "   1. Wait 2-3 minutes for the build to complete"
echo "   2. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)"
echo "   3. Clear browser cache if needed"

