#!/bin/bash

# Script to fix JWT_SECRET if it's too short
# Run this on EC2 if you get JWT key size errors

set -e

cd ~/Ecommerce-Platform || cd /home/ubuntu/Ecommerce-Platform

echo "🔧 Checking JWT_SECRET length..."

if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    exit 1
fi

if grep -q "^JWT_SECRET=" .env; then
    JWT_SECRET=$(grep "^JWT_SECRET=" .env | cut -d'=' -f2)
    CURRENT_LENGTH=${#JWT_SECRET}
    echo "Current JWT_SECRET length: $CURRENT_LENGTH characters"
    
    if [ $CURRENT_LENGTH -lt 64 ]; then
        echo "⚠️  JWT_SECRET is too short! Need at least 64 characters for HS512 algorithm."
        echo "🔨 Generating new JWT_SECRET..."
        
        # Generate 64 bytes (512 bits) for HS512
        # Base64 encoding of 64 bytes = ~88 chars
        NEW_JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n' | head -c 88)
        
        # Fallback to hex if base64 is still too short
        if [ ${#NEW_JWT_SECRET} -lt 64 ]; then
            echo "Using hex encoding as fallback..."
            NEW_JWT_SECRET=$(openssl rand -hex 64)
        fi
        
        # Update .env file
        sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$NEW_JWT_SECRET|" .env
        
        echo "✅ Generated new JWT_SECRET (${#NEW_JWT_SECRET} characters)"
        echo ""
        echo "⚠️  IMPORTANT: You need to restart the backend for this to take effect:"
        echo "   sudo docker compose restart backend"
    else
        echo "✅ JWT_SECRET length is sufficient ($CURRENT_LENGTH >= 64)"
    fi
else
    echo "❌ JWT_SECRET not found in .env file!"
    echo "🔨 Generating new JWT_SECRET..."
    
    NEW_JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n' | head -c 88)
    if [ ${#NEW_JWT_SECRET} -lt 64 ]; then
        NEW_JWT_SECRET=$(openssl rand -hex 64)
    fi
    
    echo "JWT_SECRET=$NEW_JWT_SECRET" >> .env
    echo "✅ Added JWT_SECRET to .env (${#NEW_JWT_SECRET} characters)"
    echo ""
    echo "⚠️  IMPORTANT: You need to restart the backend:"
    echo "   sudo docker compose restart backend"
fi

