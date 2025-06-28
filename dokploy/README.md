# Snotify Dokploy Deployment Guide

This folder contains everything needed to deploy Snotify to a Ubuntu 24 server using Dokploy with maximum automation.

## 🚀 Quick Start

### Prerequisites
- Ubuntu 24 server with root access
- Domain name pointed to your server IP
- SSH access to the server

### 1. Server Setup (Automated)
Run this on your Ubuntu server:
```bash
curl -sSL https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/dokploy/scripts/setup-server.sh | bash
```

### 2. Deploy Application
Run this from your local machine:
```bash
./dokploy/scripts/deploy.sh your-domain.com your-server-ip
```

### 3. Access Your App
- Application: `https://your-domain.com`
- Dokploy Panel: `http://your-server-ip:3000`

## 📁 File Structure

```
dokploy/
├── README.md                    # This file
├── Dockerfile                   # Production Docker image
├── docker-compose.yml           # Multi-service setup
├── .env.production.template     # Environment variables template
├── nginx.conf                   # Reverse proxy configuration
├── scripts/
│   ├── setup-server.sh         # Automated server setup
│   ├── deploy.sh               # Automated deployment
│   ├── backup.sh               # Database & uploads backup
│   ├── restore.sh              # Restore from backup
│   └── update.sh               # Update application
└── docs/
    ├── troubleshooting.md      # Common issues & solutions
    └── manual-setup.md         # Step-by-step manual guide
```

## 🔧 Configuration

### Environment Variables
Copy and edit the environment template:
```bash
cp dokploy/.env.production.template dokploy/.env.production
nano dokploy/.env.production
```

Required variables:
- `DOMAIN`: Your domain name
- `MYSQL_ROOT_PASSWORD`: Strong password for MySQL root
- `MYSQL_PASSWORD`: Password for application database user
- `JWT_SECRET`: Long random string for JWT tokens

### SSL Certificate
SSL certificates are automatically generated via Let's Encrypt when you deploy.

## 🛠️ Scripts Usage

### Initial Deployment
```bash
# Make scripts executable
chmod +x dokploy/scripts/*.sh

# Deploy to production
./dokploy/scripts/deploy.sh yourdomain.com 1.2.3.4
```

### Backup & Restore
```bash
# Create backup
./dokploy/scripts/backup.sh

# Restore from backup
./dokploy/scripts/restore.sh backup-file.tar.gz
```

### Updates
```bash
# Update application (pulls latest code)
./dokploy/scripts/update.sh
```

## 📊 Monitoring

### View Logs
```bash
# Application logs
docker logs snotify-app-1 -f

# Database logs
docker logs snotify-mysql-1 -f

# All services
docker-compose logs -f
```

### Health Checks
```bash
# Check service status
docker ps

# Check disk space
df -h

# Check memory usage
free -h
```

## 🔄 Maintenance

### Daily Backups
Backups are automatically created daily at 2 AM. Configure cron:
```bash
# Edit crontab
crontab -e

# Add this line:
0 2 * * * /path/to/snotify/dokploy/scripts/backup.sh
```

### Updates
Check for updates weekly:
```bash
# Check for new commits
git fetch origin main

# Deploy updates
./dokploy/scripts/update.sh
```

## 🆘 Troubleshooting

### Common Issues

**Port 3000 already in use:**
```bash
sudo lsof -i :3000
sudo kill -9 PID
```

**Docker permission denied:**
```bash
sudo usermod -aG docker $USER
newgrp docker
```

**SSL certificate issues:**
```bash
# Check certificate status
docker exec dokploy-traefik-1 cat /etc/traefik/acme/acme.json
```

**Database connection failed:**
```bash
# Check MySQL status
docker logs snotify-mysql-1
# Reset database
docker-compose down
docker volume rm snotify_mysql_data
docker-compose up -d
```

For more troubleshooting, see `docs/troubleshooting.md`

## 🔐 Security

- All passwords are generated randomly
- SSL/TLS encryption enabled by default
- Database is not exposed to public internet
- Regular security updates via automated scripts

## 📈 Performance

- Image caching enabled for faster loading
- Gzip compression for static assets
- Database query optimization
- CDN-ready static file serving

## 🤝 Support

If you encounter issues:
1. Check the logs: `docker-compose logs`
2. Review troubleshooting guide: `docs/troubleshooting.md`
3. Check Dokploy documentation: https://dokploy.com/docs
4. Create an issue in the repository

---

**Happy Deploying! 🎵** 