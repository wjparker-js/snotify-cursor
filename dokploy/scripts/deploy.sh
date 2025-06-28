#!/bin/bash

# Snotify Automated Deployment Script
# Usage: ./deploy.sh [domain] [server-ip] [ssh-user]

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DOMAIN=""
SERVER_IP=""
SSH_USER="root"
REPO_URL=""
BRANCH="main"

# Logging functions
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
    echo "Snotify Automated Deployment Script"
    echo ""
    echo "Usage: $0 [OPTIONS] <domain> <server-ip>"
    echo ""
    echo "Arguments:"
    echo "  domain      Your domain name (e.g., snotify.com)"
    echo "  server-ip   Your server IP address"
    echo ""
    echo "Options:"
    echo "  -u, --user USER     SSH user (default: root)"
    echo "  -r, --repo URL      Repository URL (auto-detected from git)"
    echo "  -b, --branch NAME   Git branch (default: main)"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 snotify.com 1.2.3.4"
    echo "  $0 -u ubuntu snotify.com 1.2.3.4"
    echo "  $0 --repo https://github.com/user/snotify.git snotify.com 1.2.3.4"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -u|--user)
            SSH_USER="$2"
            shift 2
            ;;
        -r|--repo)
            REPO_URL="$2"
            shift 2
            ;;
        -b|--branch)
            BRANCH="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        -*)
            error "Unknown option $1"
            ;;
        *)
            if [[ -z "$DOMAIN" ]]; then
                DOMAIN="$1"
            elif [[ -z "$SERVER_IP" ]]; then
                SERVER_IP="$1"
            else
                error "Too many arguments"
            fi
            shift
            ;;
    esac
done

# Validate required arguments
if [[ -z "$DOMAIN" ]] || [[ -z "$SERVER_IP" ]]; then
    error "Missing required arguments. Use -h for help."
fi

# Auto-detect repository URL if not provided
if [[ -z "$REPO_URL" ]]; then
    if git rev-parse --git-dir > /dev/null 2>&1; then
        REPO_URL=$(git config --get remote.origin.url)
        log "Auto-detected repository: $REPO_URL"
    else
        error "Not in a git repository and no repo URL provided. Use -r option or run from git repository."
    fi
fi

# Validate domain format
if ! [[ "$DOMAIN" =~ ^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$ ]]; then
    error "Invalid domain format: $DOMAIN"
fi

# Validate IP address format
if ! [[ "$SERVER_IP" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
    error "Invalid IP address format: $SERVER_IP"
fi

log "🚀 Starting Snotify deployment..."
info "Domain: $DOMAIN"
info "Server: $SERVER_IP"
info "SSH User: $SSH_USER"
info "Repository: $REPO_URL"
info "Branch: $BRANCH"

# Check if we can connect to the server
log "🔗 Testing SSH connection..."
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes "$SSH_USER@$SERVER_IP" "echo 'SSH connection successful'" 2>/dev/null; then
    error "Cannot connect to $SSH_USER@$SERVER_IP. Please check your SSH keys and server access."
fi

# Generate secure passwords
log "🔐 Generating secure passwords..."
MYSQL_ROOT_PASSWORD=$(openssl rand -base64 32)
MYSQL_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
REDIS_PASSWORD=$(openssl rand -base64 32)

# Create environment file
log "📝 Creating environment configuration..."
cat > /tmp/snotify.env << EOF
DOMAIN=$DOMAIN
ACME_EMAIL=admin@$DOMAIN
MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD
MYSQL_PASSWORD=$MYSQL_PASSWORD
DATABASE_URL=mysql://snotify:$MYSQL_PASSWORD@mysql:3306/snotify
JWT_SECRET=$JWT_SECRET
REDIS_PASSWORD=$REDIS_PASSWORD
NODE_ENV=production
PORT=4000
BACKUP_RETENTION_DAYS=30
EOF

# Deploy to server
log "📦 Deploying to server..."
ssh "$SSH_USER@$SERVER_IP" << 'ENDSSH'
    set -e
    
    # Create application directory
    mkdir -p ~/snotify
    cd ~/snotify
    
    # Clone or update repository
    if [ -d ".git" ]; then
        echo "Updating existing repository..."
        git fetch origin
        git reset --hard origin/'"$BRANCH"'
        git clean -fd
    else
        echo "Cloning repository..."
        git clone '"$REPO_URL"' .
        git checkout '"$BRANCH"'
    fi
    
    # Make scripts executable
    chmod +x dokploy/scripts/*.sh
    
    echo "Repository deployed successfully"
ENDSSH

# Copy environment file
log "🔧 Uploading environment configuration..."
scp /tmp/snotify.env "$SSH_USER@$SERVER_IP:~/snotify/.env.production"
rm /tmp/snotify.env

# Run deployment on server
log "🚀 Starting services on server..."
ssh "$SSH_USER@$SERVER_IP" << 'ENDSSH'
    set -e
    cd ~/snotify
    
    # Stop existing services if running
    if [ -f "docker-compose.yml" ]; then
        docker-compose -f dokploy/docker-compose.yml --env-file .env.production down || true
    fi
    
    # Build and start services
    docker-compose -f dokploy/docker-compose.yml --env-file .env.production up -d --build
    
    # Wait for services to be ready
    echo "Waiting for services to start..."
    sleep 30
    
    # Run database migrations
    echo "Running database migrations..."
    docker-compose -f dokploy/docker-compose.yml --env-file .env.production exec -T app npx prisma migrate deploy || true
    
    # Seed database if needed
    echo "Seeding database..."
    docker-compose -f dokploy/docker-compose.yml --env-file .env.production exec -T app npx prisma db seed || true
    
    echo "Services started successfully"
ENDSSH

# Health check
log "🏥 Performing health checks..."
sleep 10

# Check if services are running
ssh "$SSH_USER@$SERVER_IP" << 'ENDSSH'
    cd ~/snotify
    echo "Service Status:"
    docker-compose -f dokploy/docker-compose.yml --env-file .env.production ps
    
    echo ""
    echo "Health Checks:"
    
    # Check app health
    if curl -f http://localhost:4000/api/auth/health > /dev/null 2>&1; then
        echo "✅ Application: Healthy"
    else
        echo "❌ Application: Unhealthy"
    fi
    
    # Check database
    if docker-compose -f dokploy/docker-compose.yml --env-file .env.production exec -T mysql mysqladmin ping -h localhost -u root -p'"$MYSQL_ROOT_PASSWORD"' > /dev/null 2>&1; then
        echo "✅ Database: Healthy"
    else
        echo "❌ Database: Unhealthy"
    fi
    
    # Check if domain resolves to this server
    DOMAIN_IP=$(dig +short '"$DOMAIN"' || echo "")
    SERVER_IP=$(curl -s ifconfig.me || echo "")
    
    if [ "$DOMAIN_IP" = "$SERVER_IP" ]; then
        echo "✅ DNS: Domain resolves correctly"
    else
        echo "⚠️  DNS: Domain does not resolve to this server"
        echo "   Domain resolves to: $DOMAIN_IP"
        echo "   Server IP: $SERVER_IP"
    fi
ENDSSH

# Setup automatic backups
log "💾 Setting up automatic backups..."
ssh "$SSH_USER@$SERVER_IP" << 'ENDSSH'
    cd ~/snotify
    
    # Add backup cron job
    (crontab -l 2>/dev/null; echo "0 2 * * * cd ~/snotify && ./dokploy/scripts/backup.sh") | crontab -
    
    echo "Automatic daily backups configured for 2 AM"
ENDSSH

# Display deployment summary
log "🎉 Deployment completed successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Application URLs:"
echo "   • Main App: https://$DOMAIN"
echo "   • Traefik Dashboard: http://$SERVER_IP:8080"
echo ""
echo "🔐 Generated Passwords (SAVE THESE!):"
echo "   • MySQL Root: $MYSQL_ROOT_PASSWORD"
echo "   • MySQL App: $MYSQL_PASSWORD"
echo "   • Redis: $REDIS_PASSWORD"
echo ""
echo "📊 Useful Commands:"
echo "   • View logs: ssh $SSH_USER@$SERVER_IP 'cd ~/snotify && docker-compose -f dokploy/docker-compose.yml logs -f'"
echo "   • Restart services: ssh $SSH_USER@$SERVER_IP 'cd ~/snotify && docker-compose -f dokploy/docker-compose.yml restart'"
echo "   • Update app: ssh $SSH_USER@$SERVER_IP 'cd ~/snotify && ./dokploy/scripts/update.sh'"
echo "   • Create backup: ssh $SSH_USER@$SERVER_IP 'cd ~/snotify && ./dokploy/scripts/backup.sh'"
echo ""
echo "🔗 Next Steps:"
echo "   1. Wait 2-3 minutes for SSL certificate generation"
echo "   2. Visit https://$DOMAIN to access your application"
echo "   3. Create your admin account"
echo "   4. Upload your first album!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Save deployment info
cat > deployment-info.txt << EOF
Snotify Deployment Information
Generated: $(date)

Domain: $DOMAIN
Server IP: $SERVER_IP
SSH User: $SSH_USER

Passwords:
MySQL Root: $MYSQL_ROOT_PASSWORD
MySQL App: $MYSQL_PASSWORD
Redis: $REDIS_PASSWORD

URLs:
Application: https://$DOMAIN
Traefik Dashboard: http://$SERVER_IP:8080

SSH Command: ssh $SSH_USER@$SERVER_IP
EOF

log "💾 Deployment information saved to deployment-info.txt"
warn "⚠️  Keep deployment-info.txt secure - it contains sensitive passwords!"

log "🚀 Deployment completed! Your Snotify instance should be available at https://$DOMAIN in a few minutes." 