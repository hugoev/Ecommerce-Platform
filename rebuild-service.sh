#!/bin/bash

# Automatic Service Rebuild Script
# Rebuilds any Docker Compose service automatically - handles Buildx issues
# Usage: ./rebuild-service.sh [service-name]
# Example: ./rebuild-service.sh backend
#          ./rebuild-service.sh frontend
#          ./rebuild-service.sh (rebuilds all services)

set -e

SERVICE_NAME="${1:-}"

echo "🔨 Rebuilding service${SERVICE_NAME:+: $SERVICE_NAME}..."

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

# Rebuild with legacy builder
echo "   Building with legacy builder..."
export DOCKER_BUILDKIT=0
export COMPOSE_DOCKER_CLI_BUILD=0

# Check which docker-compose command to use
if command -v docker-compose &> /dev/null; then
    if [ -n "$SERVICE_NAME" ]; then
        sudo -E DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 docker-compose build "$SERVICE_NAME"
        sudo docker-compose up -d "$SERVICE_NAME"
    else
        sudo -E DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 docker-compose build
        sudo docker-compose up -d
    fi
elif docker compose version &> /dev/null 2>&1; then
    if [ -n "$SERVICE_NAME" ]; then
        sudo -E DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 docker compose build "$SERVICE_NAME"
        sudo docker compose up -d "$SERVICE_NAME"
    else
        sudo -E DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 docker compose build
        sudo docker compose up -d
    fi
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

echo "✅ Service${SERVICE_NAME:+ $SERVICE_NAME} rebuilt and restarted successfully!"

