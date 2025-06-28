#!/bin/bash

# Snotify Restore Script
# Restores database and uploads from backup

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

# Help function
show_help() {
    echo "Snotify Restore Script"
    echo ""
    echo "Usage: $0 [OPTIONS] <backup-file>"
    echo ""
    echo "Arguments:"
    echo "  backup-file     Path to backup file (.tar.gz)"
    echo ""
    echo "Options:"
    echo "  --database-only    Restore only the database"
    echo "  --uploads-only     Restore only the uploads"
    echo "  --no-confirm       Skip confirmation prompts"
    echo "  -h, --help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 ~/snotify-backups/snotify_backup_20240101_120000.tar.gz"
    echo "  $0 --database-only backup.tar.gz"
    echo "  $0 --no-confirm backup.tar.gz"
}

# Parse command line arguments
BACKUP_FILE=""
DATABASE_ONLY=false
UPLOADS_ONLY=false
NO_CONFIRM=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --database-only)
            DATABASE_ONLY=true
            shift
            ;;
        --uploads-only)
            UPLOADS_ONLY=true
            shift
            ;;
        --no-confirm)
            NO_CONFIRM=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        -*)
            error "Unknown option $1"
            ;;
        *)
            if [[ -z "$BACKUP_FILE" ]]; then
                BACKUP_FILE="$1"
            else
                error "Too many arguments"
            fi
            shift
            ;;
    esac
done

# Validate arguments
if [[ -z "$BACKUP_FILE" ]]; then
    error "Missing backup file argument. Use -h for help."
fi

if [[ ! -f "$BACKUP_FILE" ]]; then
    error "Backup file not found: $BACKUP_FILE"
fi

if [[ "$DATABASE_ONLY" == true ]] && [[ "$UPLOADS_ONLY" == true ]]; then
    error "Cannot use both --database-only and --uploads-only"
fi

# Load environment variables
if [ -f ".env.production" ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
else
    error "Environment file .env.production not found"
fi

log "🔄 Starting Snotify restore from: $(basename "$BACKUP_FILE")"

# Confirmation
if [[ "$NO_CONFIRM" != true ]]; then
    echo ""
    warn "⚠️  DANGER: This will overwrite existing data!"
    echo ""
    if [[ "$DATABASE_ONLY" != true ]]; then
        echo "   • Database will be completely replaced"
    fi
    if [[ "$UPLOADS_ONLY" != true ]]; then
        echo "   • All uploads will be replaced"
    fi
    echo ""
    read -p "Are you sure you want to continue? (type 'yes' to confirm): " -r
    if [[ ! $REPLY =~ ^yes$ ]]; then
        log "Restore cancelled by user"
        exit 0
    fi
fi

# Create temporary directory
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Extract backup
log "📦 Extracting backup..."
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# Find backup directory
BACKUP_DIR=$(find "$TEMP_DIR" -type d -name "snotify_backup_*" | head -1)
if [[ -z "$BACKUP_DIR" ]]; then
    error "Invalid backup file format"
fi

log "✅ Backup extracted to temporary directory"

# Display backup info
if [[ -f "$BACKUP_DIR/backup_info.txt" ]]; then
    info "📋 Backup Information:"
    cat "$BACKUP_DIR/backup_info.txt"
    echo ""
fi

# Stop services
log "🛑 Stopping services..."
docker-compose -f dokploy/docker-compose.yml down

# Restore database
if [[ "$UPLOADS_ONLY" != true ]]; then
    log "📊 Restoring database..."
    
    if [[ ! -f "$BACKUP_DIR/database.sql" ]]; then
        error "Database backup not found in backup file"
    fi
    
    # Start only MySQL for restore
    docker-compose -f dokploy/docker-compose.yml up -d mysql
    
    # Wait for MySQL to be ready
    log "⏳ Waiting for database to start..."
    sleep 10
    
    # Drop and recreate database
    docker-compose -f dokploy/docker-compose.yml exec -T mysql mysql \
        -u root -p"$MYSQL_ROOT_PASSWORD" \
        -e "DROP DATABASE IF EXISTS snotify; CREATE DATABASE snotify CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    
    # Restore database
    docker-compose -f dokploy/docker-compose.yml exec -T mysql mysql \
        -u root -p"$MYSQL_ROOT_PASSWORD" \
        snotify < "$BACKUP_DIR/database.sql"
    
    log "✅ Database restored successfully"
fi

# Restore uploads
if [[ "$DATABASE_ONLY" != true ]]; then
    log "📁 Restoring uploads..."
    
    if [[ -d "$BACKUP_DIR/uploads" ]]; then
        # Backup current uploads if they exist
        if [[ -d "uploads" ]]; then
            mv uploads "uploads.backup.$(date +%s)" || true
            warn "Current uploads backed up to uploads.backup.*"
        fi
        
        # Restore uploads
        cp -r "$BACKUP_DIR/uploads" .
        
        # Fix permissions
        chmod -R 755 uploads
        
        log "✅ Uploads restored successfully"
    else
        warn "No uploads found in backup"
    fi
fi

# Restore configuration (if different)
if [[ -f "$BACKUP_DIR/.env.production" ]]; then
    if ! cmp -s "$BACKUP_DIR/.env.production" ".env.production" 2>/dev/null; then
        warn "Backup contains different configuration"
        read -p "Do you want to restore the configuration? (y/N): " -r
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cp ".env.production" ".env.production.backup.$(date +%s)"
            cp "$BACKUP_DIR/.env.production" ".env.production"
            log "✅ Configuration restored (backup saved)"
        fi
    fi
fi

# Start all services
log "🚀 Starting services..."
docker-compose -f dokploy/docker-compose.yml up -d

# Wait for services to be ready
log "⏳ Waiting for services to start..."
sleep 30

# Health check
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
    warn "⚠️ Application health check failed - may need more time to start"
fi

# Display restore summary
log "🎉 Restore completed successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Restore Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗓️  Date: $(date)"
echo "📦 Source: $(basename "$BACKUP_FILE")"

if [[ "$UPLOADS_ONLY" != true ]]; then
    echo "📊 Database: Restored"
fi

if [[ "$DATABASE_ONLY" != true ]]; then
    echo "📁 Uploads: Restored"
    if [[ -d "uploads" ]]; then
        UPLOAD_SIZE=$(du -sh uploads | cut -f1)
        echo "📏 Upload Size: $UPLOAD_SIZE"
    fi
fi

echo "🌐 Status: All services running"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

log "🔗 Your application should be available at: https://$DOMAIN"
log "📊 View logs with: docker-compose -f dokploy/docker-compose.yml logs -f" 