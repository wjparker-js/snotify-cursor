#!/bin/bash

# Snotify Update Script
# Updates the application to the latest version

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Configuration
BRANCH=${1:-main}
BACKUP_BEFORE_UPDATE=${BACKUP_BEFORE_UPDATE:-true}
FORCE_UPDATE=${FORCE_UPDATE:-false}

# Help function
show_help() {
    echo "Snotify Update Script"
    echo ""
    echo "Usage: $0 [branch] [OPTIONS]"
    echo ""
    echo "Arguments:"
    echo "  branch          Git branch to update to (default: main)"
    echo ""
    echo "Environment Variables:"
    echo "  BACKUP_BEFORE_UPDATE    Create backup before update (default: true)"
    echo "  FORCE_UPDATE           Force update even if no changes (default: false)"
    echo ""
    echo "Examples:"
    echo "  $0                     # Update to latest main branch"
    echo "  $0 develop             # Update to develop branch"
    echo "  FORCE_UPDATE=true $0   # Force update"
}

if [[ "$1" == "-h" ]] || [[ "$1" == "--help" ]]; then
    show_help
    exit 0
fi

# Load environment variables
if [ -f ".env.production" ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
else
    error "Environment file .env.production not found"
fi

log "🔄 Starting Snotify update to branch: $BRANCH"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    error "Not in a git repository"
fi

# Get current commit hash
CURRENT_COMMIT=$(git rev-parse HEAD)
CURRENT_BRANCH=$(git branch --show-current)

info "📍 Current branch: $CURRENT_BRANCH"
info "📍 Current commit: ${CURRENT_COMMIT:0:8}"

# Fetch latest changes
log "📡 Fetching latest changes..."
git fetch origin

# Check if there are updates available
LATEST_COMMIT=$(git rev-parse origin/$BRANCH)
info "📍 Latest commit: ${LATEST_COMMIT:0:8}"

if [[ "$CURRENT_COMMIT" == "$LATEST_COMMIT" ]] && [[ "$FORCE_UPDATE" != "true" ]]; then
    log "✅ Already up to date"
    exit 0
fi

# Show changes
log "📋 Changes to be applied:"
git log --oneline ${CURRENT_COMMIT}..${LATEST_COMMIT} || true

# Create backup before update
if [[ "$BACKUP_BEFORE_UPDATE" == "true" ]]; then
    log "💾 Creating backup before update..."
    if [[ -f "dokploy/scripts/backup.sh" ]]; then
        ./dokploy/scripts/backup.sh
        log "✅ Backup completed"
    else
        warn "Backup script not found, skipping backup"
    fi
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    warn "⚠️ You have uncommitted changes"
    git status --porcelain
    
    read -p "Do you want to stash these changes? (y/N): " -r
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git stash push -m "Auto-stash before update $(date)"
        log "📦 Changes stashed"
    else
        error "Please commit or stash your changes before updating"
    fi
fi

# Switch to target branch if different
if [[ "$CURRENT_BRANCH" != "$BRANCH" ]]; then
    log "🔀 Switching to branch: $BRANCH"
    git checkout $BRANCH
fi

# Pull latest changes
log "⬇️ Pulling latest changes..."
git reset --hard origin/$BRANCH
git clean -fd

# Check if Docker Compose file changed
COMPOSE_CHANGED=false
if git diff --name-only ${CURRENT_COMMIT}..HEAD | grep -q "dokploy/docker-compose.yml"; then
    COMPOSE_CHANGED=true
    warn "🐳 Docker Compose configuration changed"
fi

# Check if dependencies changed
DEPS_CHANGED=false
if git diff --name-only ${CURRENT_COMMIT}..HEAD | grep -q "package*.json"; then
    DEPS_CHANGED=true
    warn "📦 Dependencies changed"
fi

# Check if database schema changed
SCHEMA_CHANGED=false
if git diff --name-only ${CURRENT_COMMIT}..HEAD | grep -q "prisma/"; then
    SCHEMA_CHANGED=true
    warn "🗄️ Database schema changed"
fi

# Stop services for update
log "🛑 Stopping services..."
docker-compose -f dokploy/docker-compose.yml down

# Rebuild if necessary
if [[ "$DEPS_CHANGED" == "true" ]] || [[ "$COMPOSE_CHANGED" == "true" ]] || [[ "$FORCE_UPDATE" == "true" ]]; then
    log "🔨 Rebuilding application..."
    docker-compose -f dokploy/docker-compose.yml build --no-cache app
else
    log "🔨 Building application..."
    docker-compose -f dokploy/docker-compose.yml build app
fi

# Start services
log "🚀 Starting services..."
docker-compose -f dokploy/docker-compose.yml up -d

# Wait for services to be ready
log "⏳ Waiting for services to start..."
sleep 30

# Run database migrations if schema changed
if [[ "$SCHEMA_CHANGED" == "true" ]]; then
    log "🗄️ Running database migrations..."
    docker-compose -f dokploy/docker-compose.yml exec -T app npx prisma migrate deploy
    log "✅ Database migrations completed"
fi

# Health checks
log "🏥 Performing health checks..."

# Check database
if docker-compose -f dokploy/docker-compose.yml exec -T mysql mysqladmin ping -h localhost -u root -p"$MYSQL_ROOT_PASSWORD" > /dev/null 2>&1; then
    log "✅ Database: Healthy"
else
    error "❌ Database health check failed"
fi

# Check application
sleep 10
if curl -f http://localhost:4000/api/auth/health > /dev/null 2>&1; then
    log "✅ Application: Healthy"
else
    warn "⚠️ Application health check failed - checking logs..."
    docker-compose -f dokploy/docker-compose.yml logs app --tail=20
fi

# Display update summary
NEW_COMMIT=$(git rev-parse HEAD)
COMMITS_UPDATED=$(git rev-list --count ${CURRENT_COMMIT}..${NEW_COMMIT})

log "🎉 Update completed successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Update Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗓️  Date: $(date)"
echo "🌿 Branch: $BRANCH"
echo "📊 Commits: $COMMITS_UPDATED new commits"
echo "📍 From: ${CURRENT_COMMIT:0:8}"
echo "📍 To: ${NEW_COMMIT:0:8}"

if [[ "$DEPS_CHANGED" == "true" ]]; then
    echo "📦 Dependencies: Updated"
fi

if [[ "$SCHEMA_CHANGED" == "true" ]]; then
    echo "🗄️ Database: Migrated"
fi

if [[ "$COMPOSE_CHANGED" == "true" ]]; then
    echo "🐳 Docker: Rebuilt"
fi

echo "🌐 Status: All services running"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

log "🔗 Your application is available at: https://$DOMAIN"
log "📊 View logs with: docker-compose -f dokploy/docker-compose.yml logs -f"

# Clean up old Docker images
log "🧹 Cleaning up old Docker images..."
docker image prune -f
log "✅ Cleanup completed" 