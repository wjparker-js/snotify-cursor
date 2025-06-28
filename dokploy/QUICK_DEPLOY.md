# 🚀 Snotify Quick Deploy Guide

**Deploy Snotify to Ubuntu 24 with Dokploy in 3 simple steps!**

## Prerequisites ✅
- Ubuntu 24 server with root/sudo access
- Domain name pointed to your server IP
- SSH key access to server

## Step 1: Server Setup 🖥️

**On your Ubuntu server, run:**
```bash
curl -sSL https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/dokploy/scripts/setup-server.sh | bash
```

**Then log out and back in to apply Docker permissions.**

## Step 2: Deploy Application 🚀

**From your local machine (in the project directory):**
```bash
# Make scripts executable (Linux/Mac)
chmod +x dokploy/scripts/*.sh

# Deploy to your server
./dokploy/scripts/deploy.sh yourdomain.com your-server-ip
```

**For Windows users:** Use Git Bash or WSL to run the deploy script.

## Step 3: Access Your App 🎵

- **Application:** `https://yourdomain.com`
- **Dokploy Panel:** `http://your-server-ip:3000`

**Wait 2-3 minutes for SSL certificate generation!**

---

## Alternative: Manual Deployment

If the automated script doesn't work, follow these manual steps:

### 1. Setup Server Manually
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Dokploy
curl -sSL https://dokploy.com/install.sh | sh
```

### 2. Deploy Application Manually
```bash
# Clone repository
git clone YOUR_REPO_URL ~/snotify
cd ~/snotify

# Copy environment template
cp dokploy/env.production.template .env.production

# Edit environment variables
nano .env.production
# Set: DOMAIN, MYSQL_ROOT_PASSWORD, MYSQL_PASSWORD, JWT_SECRET

# Deploy with Docker Compose
docker-compose -f dokploy/docker-compose.yml --env-file .env.production up -d
```

---

## Quick Commands 🔧

```bash
# View logs
docker-compose -f dokploy/docker-compose.yml logs -f

# Restart services
docker-compose -f dokploy/docker-compose.yml restart

# Stop services
docker-compose -f dokploy/docker-compose.yml down

# Update application
./dokploy/scripts/update.sh

# Create backup
./dokploy/scripts/backup.sh

# Restore backup
./dokploy/scripts/restore.sh backup-file.tar.gz
```

---

## Troubleshooting 🔍

**Port already in use:**
```bash
sudo lsof -i :3000
sudo kill -9 PID
```

**Docker permission denied:**
```bash
sudo usermod -aG docker $USER
newgrp docker
```

**SSL not working:**
- Ensure domain points to server IP
- Wait 2-3 minutes for certificate generation
- Check firewall allows ports 80 and 443

**For more issues:** See `dokploy/docs/troubleshooting.md`

---

## File Structure 📁

```
dokploy/
├── README.md                    # Complete guide
├── QUICK_DEPLOY.md             # This file
├── Dockerfile                  # Production image
├── docker-compose.yml          # Services configuration
├── env.production.template     # Environment template
├── scripts/
│   ├── setup-server.sh        # Server setup automation
│   ├── deploy.sh              # Deployment automation
│   ├── backup.sh              # Backup creation
│   ├── restore.sh             # Backup restoration
│   ├── update.sh              # Application updates
│   └── start.sh               # Container startup
└── docs/
    └── troubleshooting.md     # Detailed troubleshooting
```

---

## Support 💬

- **Documentation:** `dokploy/README.md`
- **Troubleshooting:** `dokploy/docs/troubleshooting.md`
- **Issues:** Create GitHub issue with logs

---

**�� Happy Deploying!** 