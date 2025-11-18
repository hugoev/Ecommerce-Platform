#!/bin/bash

# Automatic Backend Rebuild Script
# Handles Buildx issues automatically - no manual steps needed

set -e

echo "🔨 Rebuilding backend automatically..."

# Check if we're in the project directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found. Run this script from the project root."
    exit 1
fi

# Temporarily disable Buildx to avoid panic
echo "   Temporarily disabling Buildx..."
BUILDX_DISABLED=false

if [ -f ~/.docker/cli-plugins/docker-buildx ] && [ -x ~/.docker/cli-plugins/docker-buildx ]; then
    mv ~/.docker/cli-plugins/docker-buildx ~/.docker/cli-plugins/docker-buildx.disabled 2>/dev/null
    BUILDX_DISABLED=true
fi
if [ -f /usr/local/lib/docker/cli-plugins/docker-buildx ] && [ -x /usr/local/lib/docker/cli-plugins/docker-buildx ]; then
    sudo mv /usr/local/lib/docker/cli-plugins/docker-buildx /usr/local/lib/docker/cli-plugins/docker-buildx.disabled 2>/dev/null
    BUILDX_DISABLED=true
fi

# Rebuild backend with legacy builder
echo "   Building backend with legacy builder..."
export DOCKER_BUILDKIT=0
export COMPOSE_DOCKER_CLI_BUILD=0

# Check which docker-compose command to use
if command -v docker-compose &> /dev/null; then
    sudo -E DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 docker-compose build backend
    sudo docker-compose up -d backend
elif docker compose version &> /dev/null 2>&1; then
    sudo -E DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 docker compose build backend
    sudo docker compose up -d backend
else
    echo "❌ Error: docker-compose not found"
    exit 1
fi

# Restore Buildx
if [ "$BUILDX_DISABLED" = true ]; then
    echo "   Restoring Buildx..."
    if [ -f ~/.docker/cli-plugins/docker-buildx.disabled ]; then
        mv ~/.docker/cli-plugins/docker-buildx.disabled ~/.docker/cli-plugins/docker-buildx 2>/dev/null
    fi
    if [ -f /usr/local/lib/docker/cli-plugins/docker-buildx.disabled ]; then
        sudo mv /usr/local/lib/docker/cli-plugins/docker-buildx.disabled /usr/local/lib/docker/cli-plugins/docker-buildx 2>/dev/null
    fi
fi

echo "✅ Backend rebuilt and restarted successfully!"

