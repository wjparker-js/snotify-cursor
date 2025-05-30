# Deployment Guide for Ubuntu LAMP Server

## Prerequisites

- Ubuntu Server 20.04 LTS or higher
- Root access or sudo privileges
- Domain name (optional but recommended)

## 1. Update System

```bash
sudo apt update
sudo apt upgrade -y
```

## 2. Install Required Software

```bash
# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Apache
sudo apt install -y apache2

# Install PM2 for process management
sudo npm install -g pm2
```

## 3. Configure Apache

```bash
# Enable required modules
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite

# Create virtual host configuration
sudo nano /etc/apache2/sites-available/your-app.conf
```

Add this configuration:

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    ServerAdmin webmaster@yourdomain.com
    DocumentRoot /var/www/html/your-app

    ProxyPreserveHost On
    ProxyPass / http://localhost:8080/
    ProxyPassReverse / http://localhost:8080/

    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

Enable the site:
```bash
sudo a2ensite your-app.conf
sudo systemctl restart apache2
```

## 4. Deploy Application

```bash
# Create deployment directory
sudo mkdir -p /var/www/html/your-app
sudo chown -R $USER:$USER /var/www/html/your-app

# Clone repository
git clone <your-repo-url> /var/www/html/your-app
cd /var/www/html/your-app

# Install dependencies
npm install

# Build the application
npm run build

# Start the application with PM2
pm2 start npm --name "your-app" -- start
pm2 save
pm2 startup
```

## 5. Environment Setup

Create `.env` file in your application root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 6. SSL Configuration (Optional but Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-apache

# Get SSL certificate
sudo certbot --apache -d yourdomain.com
```

## 7. Maintenance

### Updating the Application

```bash
cd /var/www/html/your-app
git pull
npm install
npm run build
pm2 restart your-app
```

### Monitoring

```bash
# View logs
pm2 logs your-app

# Monitor application
pm2 monit
```

### Backup

```bash
# Backup application files
sudo tar -czf /backup/your-app-$(date +%Y%m%d).tar.gz /var/www/html/your-app
```

## Troubleshooting

1. If the application isn't accessible:
   - Check Apache status: `sudo systemctl status apache2`
   - Check PM2 status: `pm2 status`
   - Check logs: `pm2 logs your-app`

2. If SSL certificate isn't working:
   - Check Apache SSL configuration
   - Verify certificate renewal: `sudo certbot renew --dry-run`

3. Permission issues:
   - Ensure proper ownership: `sudo chown -R $USER:$USER /var/www/html/your-app`
   - Check Apache logs: `sudo tail -f /var/log/apache2/error.log`