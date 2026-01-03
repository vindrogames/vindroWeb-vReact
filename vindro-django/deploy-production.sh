#!/bin/bash

# Production Deployment Script for Vindro Django Backend
# This script automates the deployment process

set -e  # Exit on any error

echo "🚀 Starting production deployment..."

# Check if .env.prod exists
if [ ! -f .env.prod ]; then
    echo "❌ Error: .env.prod file not found!"
    echo "Please create .env.prod file with your production environment variables."
    echo "See .env.example for reference."
    exit 1
fi

# Load environment variables
echo "📝 Loading environment variables from .env.prod..."
source .env.prod

# Check required variables
if [ -z "$GOOGLE_CLIENT_ID" ] || [ -z "$GOOGLE_CLIENT_SECRET" ]; then
    echo "⚠️  Warning: Google OAuth credentials not found in .env.prod"
    echo "You will need to set up OAuth manually after deployment."
fi

# Build new image
echo "🔨 Building Docker image..."
docker build -t vindro-django:latest .

# Stop and remove old container
echo "🛑 Stopping old container..."
docker stop vindro-django 2>/dev/null || true
docker rm vindro-django 2>/dev/null || true

# Run new container
echo "🏃 Starting new container..."
docker run -d \
  --name vindro-django \
  -p 8000:8000 \
  --env-file .env.prod \
  --restart unless-stopped \
  -v vindro-db:/app/src \
  vindro-django:latest

# Wait for container to start
echo "⏳ Waiting for container to start..."
sleep 5

# Check if container is running
if ! docker ps | grep -q vindro-django; then
    echo "❌ Error: Container failed to start!"
    echo "Check logs with: docker logs vindro-django"
    exit 1
fi

# Run migrations
echo "🔄 Running database migrations..."
docker exec vindro-django uv run python src/manage.py migrate

# Setup Google OAuth if credentials are available
if [ -n "$GOOGLE_CLIENT_ID" ] && [ -n "$GOOGLE_CLIENT_SECRET" ]; then
    echo "🔐 Setting up Google OAuth..."
    docker exec vindro-django uv run python src/manage.py setup_google_oauth "$GOOGLE_CLIENT_ID" "$GOOGLE_CLIENT_SECRET"
else
    echo "⚠️  Skipping Google OAuth setup (credentials not found)"
fi

# Collect static files
echo "📦 Collecting static files..."
docker exec vindro-django uv run python src/manage.py collectstatic --noinput || true

# Show status
echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Container status:"
docker ps | grep vindro-django

echo ""
echo "📋 Quick commands:"
echo "  View logs:       docker logs -f vindro-django"
echo "  Check status:    docker ps | grep vindro-django"
echo "  Restart:         docker restart vindro-django"
echo "  Stop:            docker stop vindro-django"
echo ""
echo "🌐 Your backend should now be accessible at:"
echo "  https://backend.vindrogames.com"
