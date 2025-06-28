#!/bin/bash

# Snotify Application Startup Script
# This script runs inside the Docker container

set -e

echo "🚀 Starting Snotify application..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
while ! npx prisma db push --accept-data-loss 2>/dev/null; do
    echo "Database not ready, waiting 5 seconds..."
    sleep 5
done

echo "✅ Database connection established"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "📊 Running database migrations..."
npx prisma migrate deploy || echo "⚠️ Migration failed, continuing..."

# Create uploads directory if it doesn't exist
mkdir -p uploads/albums

# Start the application
echo "🎵 Starting Snotify server..."
exec node dist/server.js 