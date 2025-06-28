# Snotify Troubleshooting Guide

This guide covers common issues and their solutions for Snotify deployment.

## 🚨 Common Issues

### 1. Port Already in Use

**Error:** `Port 3000/4000/80/443 is already in use`

**Solutions:**
```bash
# Find process using the port
sudo lsof -i :3000
sudo netstat -tulpn | grep :3000

# Kill the process
sudo kill -9 PID

# Or stop all Docker containers
docker stop $(docker ps -aq)
```

### 2. Docker Permission Denied

**Error:** `Permission denied while trying to connect to the Docker daemon`

**Solutions:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Or restart the session
logout
# Log back in

# Fix Docker socket permissions
sudo chmod 666 /var/run/docker.sock
```

### 3. SSL Certificate Issues

**Error:** SSL certificate not generating or invalid

**Diagnosis:**
```bash
# Check Traefik logs
docker logs snotify-traefik-1 -f

# Check certificate status
docker exec snotify-traefik-1 cat /etc/traefik/acme/acme.json

# Verify domain DNS
dig +short yourdomain.com
```

**Solutions:**
```bash
# Ensure domain points to server IP
# Wait 2-3 minutes for certificate generation
# Check firewall allows ports 80 and 443

# Reset certificates if needed
docker-compose -f dokploy/docker-compose.yml down
docker volume rm snotify_traefik_letsencrypt
docker-compose -f dokploy/docker-compose.yml up -d
```

### 4. Database Connection Failed

**Error:** `Can't connect to MySQL server`

**Diagnosis:**
```bash
# Check MySQL container status
docker ps | grep mysql

# Check MySQL logs
docker logs snotify-mysql-1 -f

# Test connection
docker exec -it snotify-mysql-1 mysql -u root -p
```

**Solutions:**
```bash
# Restart MySQL container
docker-compose -f dokploy/docker-compose.yml restart mysql

# Reset database (⚠️ DATA LOSS)
docker-compose -f dokploy/docker-compose.yml down
docker volume rm snotify_mysql_data
docker-compose -f dokploy/docker-compose.yml up -d

# Check environment variables
cat .env.production | grep MYSQL
```

### 5. Application Won't Start

**Error:** Application container keeps restarting

**Diagnosis:**
```bash
# Check application logs
docker logs snotify-app-1 -f

# Check container status
docker ps -a | grep snotify

# Inspect container
docker inspect snotify-app-1
```

**Solutions:**
```bash
# Check environment variables
docker exec snotify-app-1 env | grep -E "(DATABASE_URL|JWT_SECRET)"

# Rebuild application
docker-compose -f dokploy/docker-compose.yml build --no-cache app
docker-compose -f dokploy/docker-compose.yml up -d

# Check disk space
df -h
```

### 6. File Upload Issues

**Error:** Cannot upload albums or images

**Diagnosis:**
```bash
# Check uploads directory permissions
ls -la uploads/
docker exec snotify-app-1 ls -la /app/uploads/

# Check disk space
df -h
```

**Solutions:**
```bash
# Fix permissions
sudo chown -R 1001:1001 uploads/
sudo chmod -R 755 uploads/

# Create missing directories
mkdir -p uploads/albums
```

### 7. Memory Issues

**Error:** Out of memory errors or slow performance

**Diagnosis:**
```bash
# Check memory usage
free -h
docker stats

# Check swap
swapon --show
```

**Solutions:**
```bash
# Create swap file (if not exists)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Restart services
docker-compose -f dokploy/docker-compose.yml restart
```

## 🔧 Diagnostic Commands

### System Health Check
```bash
# Quick system overview
./dokploy/scripts/health-check.sh

# Or manually:
docker ps
docker-compose -f dokploy/docker-compose.yml ps
curl -I http://localhost:4000/api/auth/health
```

### View All Logs
```bash
# All services
docker-compose -f dokploy/docker-compose.yml logs -f

# Specific service
docker-compose -f dokploy/docker-compose.yml logs -f app
docker-compose -f dokploy/docker-compose.yml logs -f mysql
docker-compose -f dokploy/docker-compose.yml logs -f traefik
```

### Database Inspection
```bash
# Connect to database
docker exec -it snotify-mysql-1 mysql -u root -p

# Show databases and tables
SHOW DATABASES;
USE snotify;
SHOW TABLES;
SELECT COUNT(*) FROM User;
SELECT COUNT(*) FROM Album;
```

### Container Resource Usage
```bash
# Real-time stats
docker stats

# Container inspection
docker exec snotify-app-1 ps aux
docker exec snotify-app-1 df -h
```

## 🚨 Emergency Recovery

### Complete Reset (⚠️ DATA LOSS)
```bash
# Stop all services
docker-compose -f dokploy/docker-compose.yml down

# Remove all volumes (DELETES ALL DATA)
docker volume rm snotify_mysql_data snotify_traefik_letsencrypt snotify_redis_data

# Remove all containers
docker container prune -f

# Remove all images
docker image prune -a -f

# Start fresh
docker-compose -f dokploy/docker-compose.yml up -d
```

### Restore from Backup
```bash
# List available backups
ls -la ~/snotify-backups/

# Restore specific backup
./dokploy/scripts/restore.sh ~/snotify-backups/snotify_backup_YYYYMMDD_HHMMSS.tar.gz
```

### Manual Database Repair
```bash
# Enter MySQL container
docker exec -it snotify-mysql-1 bash

# Run MySQL repair
mysqlcheck -u root -p --auto-repair --all-databases

# Or repair specific table
mysqlcheck -u root -p --repair snotify Album
```

## 📊 Performance Optimization

### Database Optimization
```sql
-- Connect to MySQL and run:
ANALYZE TABLE Album, Song, User, Playlist;
OPTIMIZE TABLE Album, Song, User, Playlist;

-- Check slow queries
SHOW PROCESSLIST;
SHOW FULL PROCESSLIST;
```

### Docker Optimization
```bash
# Clean up unused resources
docker system prune -f
docker volume prune -f
docker network prune -f

# Limit container resources (edit docker-compose.yml)
services:
  app:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

### File System Optimization
```bash
# Check disk usage
du -sh uploads/*
du -sh ~/snotify-backups/*

# Clean old backups
find ~/snotify-backups -name "*.tar.gz" -mtime +30 -delete

# Compress large uploads
find uploads/ -name "*.mp3" -size +10M -exec gzip {} \;
```

## 🔍 Advanced Debugging

### Enable Debug Logging
```bash
# Edit .env.production
echo "LOG_LEVEL=debug" >> .env.production

# Restart application
docker-compose -f dokploy/docker-compose.yml restart app
```

### Network Debugging
```bash
# Test internal network connectivity
docker exec snotify-app-1 ping mysql
docker exec snotify-app-1 telnet mysql 3306

# Check external connectivity
docker exec snotify-app-1 curl -I https://google.com
```

### SSL/TLS Debugging
```bash
# Test SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Check certificate expiry
echo | openssl s_client -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

## 📞 Getting Help

### Before Asking for Help
1. Check this troubleshooting guide
2. Review the logs: `docker-compose logs -f`
3. Verify system requirements
4. Try restarting services: `docker-compose restart`

### Information to Provide
```bash
# Gather system information
uname -a
docker --version
docker-compose --version
free -h
df -h
docker ps -a
docker-compose -f dokploy/docker-compose.yml logs --tail=50
```

### Support Channels
- GitHub Issues: Create an issue with logs and system info
- Documentation: Check the main README.md
- Community: Discord/Slack (if available)

## 📝 Prevention Tips

1. **Regular Backups**: Ensure daily backups are running
2. **Monitor Disk Space**: Keep at least 20% free space
3. **Update Regularly**: Run `./dokploy/scripts/update.sh` weekly
4. **Monitor Logs**: Check logs weekly for warnings
5. **Test Restores**: Test backup restoration monthly
6. **Security Updates**: Keep the server OS updated

---

**Remember:** Always backup your data before making significant changes! 