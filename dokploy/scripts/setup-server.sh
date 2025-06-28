#!/bin/bash

# Snotify Server Setup Script for Ubuntu 24
# This script installs Docker, Docker Compose, and Dokploy

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root for security reasons. Please run as a regular user with sudo privileges."
fi

# Check if running on Ubuntu
if ! grep -q "Ubuntu" /etc/os-release; then
    error "This script is designed for Ubuntu. Your OS: $(cat /etc/os-release | grep PRETTY_NAME)"
fi

log "🚀 Starting Snotify server setup on Ubuntu 24..."

# Update system packages
log "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
log "🔧 Installing essential packages..."
sudo apt install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw \
    htop \
    nano \
    tree

# Install Docker
log "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    # Add Docker's official GPG key
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Add Docker repository
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
        $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    
    log "✅ Docker installed successfully"
else
    log "✅ Docker is already installed"
fi

# Install Docker Compose (standalone)
log "🔄 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    sudo curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    log "✅ Docker Compose ${COMPOSE_VERSION} installed successfully"
else
    log "✅ Docker Compose is already installed"
fi

# Install Node.js and npm (for local development)
log "📦 Installing Node.js and npm..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    log "✅ Node.js $(node --version) and npm $(npm --version) installed successfully"
else
    log "✅ Node.js is already installed: $(node --version)"
fi

# Configure firewall
log "🔒 Configuring firewall..."
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 3000/tcp # Dokploy
log "✅ Firewall configured"

# Install Dokploy
log "🚀 Installing Dokploy..."
if ! command -v dokploy &> /dev/null; then
    curl -sSL https://dokploy.com/install.sh | sh
    log "✅ Dokploy installed successfully"
else
    log "✅ Dokploy is already installed"
fi

# Create application directory
log "📁 Creating application directory..."
mkdir -p ~/snotify
cd ~/snotify

# Create docker group if it doesn't exist and add user
if ! getent group docker > /dev/null 2>&1; then
    sudo groupadd docker
fi
sudo usermod -aG docker $USER

# Configure Docker to start on boot
sudo systemctl enable docker
sudo systemctl start docker

# Create swap file if not exists (recommended for small VPS)
if ! swapon --show | grep -q "/swapfile"; then
    log "💾 Creating swap file..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    log "✅ 2GB swap file created"
fi

# Install useful monitoring tools
log "📊 Installing monitoring tools..."
sudo apt install -y htop iotop nethogs

# Create log directory
sudo mkdir -p /var/log/snotify
sudo chown $USER:$USER /var/log/snotify

# Display system information
log "📋 System Information:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🖥️  OS: $(lsb_release -d | cut -f2)"
echo "💾 RAM: $(free -h | awk '/^Mem:/ {print $2}')"
echo "💿 Disk: $(df -h / | awk 'NR==2 {print $4 " available of " $2}')"
echo "🐳 Docker: $(docker --version)"
echo "🔄 Docker Compose: $(docker-compose --version)"
echo "📦 Node.js: $(node --version)"
echo "📦 npm: $(npm --version)"
echo "🚀 Dokploy: Installed"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

log "🎉 Server setup completed successfully!"
log "📝 Next steps:"
echo "   1. Log out and log back in (or run 'newgrp docker') to apply Docker group membership"
echo "   2. Access Dokploy at: http://$(curl -s ifconfig.me):3000"
echo "   3. Clone your Snotify repository"
echo "   4. Run the deployment script from your local machine"
echo ""
warn "⚠️  IMPORTANT: Please log out and log back in before proceeding with deployment!"
echo ""
log "🔗 Useful commands:"
echo "   • Check Docker: docker run hello-world"
echo "   • View logs: sudo journalctl -u docker.service"
echo "   • Dokploy status: sudo systemctl status dokploy" 