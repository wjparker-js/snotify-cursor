#!/bin/bash

# Snotify Backup Script
# Creates backups of database and uploads

set -e

# Configuration
BACKUP_DIR="$HOME/snotify-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="snotify_backup_$TIMESTAMP"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Load environment variables
if [ -f ".env.production" ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

log "🗄️ Starting Snotify backup..."

# Create backup directory
mkdir -p "$BACKUP_DIR"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
mkdir -p "$BACKUP_PATH"

# Backup database
log "📊 Backing up database..."
if docker-compose -f dokploy/docker-compose.yml ps mysql | grep -q "Up"; then
    docker-compose -f dokploy/docker-compose.yml exec -T mysql mysqldump \
        -u root -p"$MYSQL_ROOT_PASSWORD" \
        --single-transaction \
        --routines \
        --triggers \
        snotify > "$BACKUP_PATH/database.sql"
    log "✅ Database backup completed"
else
    error "MySQL container is not running"
fi

# Backup uploads
log "📁 Backing up uploads..."
if [ -d "uploads" ]; then
    cp -r uploads "$BACKUP_PATH/"
    log "✅ Uploads backup completed"
else
    warn "Uploads directory not found"
fi

# Backup configuration
log "⚙️ Backing up configuration..."
cp .env.production "$BACKUP_PATH/" 2>/dev/null || warn "Environment file not found"
cp dokploy/docker-compose.yml "$BACKUP_PATH/" 2>/dev/null || warn "Docker compose file not found"

# Create backup info
cat > "$BACKUP_PATH/backup_info.txt" << EOF
Snotify Backup Information
Created: $(date)
Hostname: $(hostname)
Docker Images:
$(docker-compose -f dokploy/docker-compose.yml images)

Container Status:
$(docker-compose -f dokploy/docker-compose.yml ps)

Disk Usage:
$(du -sh uploads 2>/dev/null || echo "Uploads: N/A")
$(du -sh "$BACKUP_PATH/database.sql" 2>/dev/null || echo "Database: N/A")
EOF

# Compress backup
log "🗜️ Compressing backup..."
cd "$BACKUP_DIR"
tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"
rm -rf "$BACKUP_NAME"

# Get backup size
BACKUP_SIZE=$(du -sh "$BACKUP_NAME.tar.gz" | cut -f1)
log "✅ Backup compressed: $BACKUP_SIZE"

# Clean old backups
log "🧹 Cleaning old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "snotify_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete
REMAINING_BACKUPS=$(ls -1 "$BACKUP_DIR"/snotify_backup_*.tar.gz 2>/dev/null | wc -l)
log "📦 Remaining backups: $REMAINING_BACKUPS"

# Upload to cloud storage (if configured)
if [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$BACKUP_S3_BUCKET" ]; then
    log "☁️ Uploading to S3..."
    if command -v aws &> /dev/null; then
        aws s3 cp "$BACKUP_DIR/$BACKUP_NAME.tar.gz" "s3://$BACKUP_S3_BUCKET/snotify-backups/"
        log "✅ Backup uploaded to S3"
    else
        warn "AWS CLI not installed, skipping S3 upload"
    fi
fi

# Send notification (if configured)
if [ -n "$WEBHOOK_URL" ]; then
    curl -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"text\":\"✅ Snotify backup completed: $BACKUP_NAME.tar.gz ($BACKUP_SIZE)\"}" \
        2>/dev/null || warn "Failed to send notification"
fi

log "🎉 Backup completed successfully!"
log "📍 Backup location: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
log "📏 Backup size: $BACKUP_SIZE"

# Display backup summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Backup Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗓️  Date: $(date)"
echo "📦 Name: $BACKUP_NAME.tar.gz"
echo "📏 Size: $BACKUP_SIZE"
echo "📍 Path: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
echo "🗂️  Total Backups: $REMAINING_BACKUPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" 