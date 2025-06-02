# Deployment Guide

This guide covers how to deploy the application using either Netlify (recommended) or self-hosting options.

## Netlify Deployment (Recommended)

### Prerequisites
- GitHub account
- Netlify account
- Supabase project

### Steps

1. **Connect to Netlify**
   - Click the "Deploy to Netlify" button in your project
   - Connect your GitHub repository
   - Authorize Netlify to access your repository

2. **Configure Build Settings**
   ```
   Build Command: npm run build
   Publish Directory: dist
   ```

3. **Environment Variables**
   Add the following environment variables in Netlify:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Deploy**
   - Netlify will automatically build and deploy your site
   - Any future pushes to your main branch will trigger automatic deployments

### Custom Domain (Optional)
1. Go to Site Settings > Domain Management
2. Click "Add custom domain"
3. Follow Netlify's DNS configuration instructions

## Self-Hosting Option

### Prerequisites
- Ubuntu Server 20.04 LTS or higher
- Node.js 18+ and npm
- Apache or Nginx
- SSL certificate (recommended)

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2
```

### 2. Application Setup

```bash
# Create application directory
sudo mkdir -p /var/www/gerrbill
sudo chown -R $USER:$USER /var/www/gerrbill

# Clone repository
git clone <your-repo-url> /var/www/gerrbill
cd /var/www/gerrbill

# Install dependencies
npm install

# Create environment file
cat > .env << EOL
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
EOL

# Build application
npm run build
```

### 3. Web Server Configuration

#### Option A: Nginx (Recommended)

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/gerrbill
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/gerrbill/dist;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/gerrbill /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Option B: Apache

```bash
# Install Apache
sudo apt install -y apache2

# Create Apache configuration
sudo nano /etc/apache2/sites-available/gerrbill.conf
```

Add this configuration:
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/gerrbill/dist

    <Directory /var/www/gerrbill/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/gerrbill-error.log
    CustomLog ${APACHE_LOG_DIR}/gerrbill-access.log combined
</VirtualHost>
```

Enable the site:
```bash
sudo a2ensite gerrbill.conf
sudo a2enmod rewrite
sudo systemctl restart apache2
```

### 4. SSL Configuration (Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx
# For Nginx:
sudo certbot --nginx -d your-domain.com

# For Apache:
sudo apt install -y python3-certbot-apache
sudo certbot --apache -d your-domain.com
```

### 5. Maintenance

#### Updating the Application

```bash
cd /var/www/gerrbill
git pull
npm install
npm run build
```

#### Monitoring

```bash
# Check Nginx/Apache status
sudo systemctl status nginx  # or apache2

# View logs
sudo tail -f /var/log/nginx/error.log  # or /var/log/apache2/error.log
```

## Troubleshooting

### Common Issues

1. **Blank Page After Deployment**
   - Check if environment variables are set correctly
   - Verify build output in dist directory
   - Check browser console for errors

2. **API Errors**
   - Verify Supabase URL and key are correct
   - Check CORS settings in Supabase
   - Ensure Edge Functions are deployed

3. **404 Errors on Refresh**
   - Verify web server configuration for SPA routing
   - Check .htaccess file (Apache) or try_files directive (Nginx)

### Support

For additional help:
1. Check the [GitHub repository issues](https://github.com/your-repo/issues)
2. Review Supabase documentation
3. Contact your hosting provider's support

## Security Considerations

1. **Environment Variables**
   - Never commit .env files
   - Use hosting provider's environment variable management
   - Rotate keys periodically

2. **SSL/TLS**
   - Always use HTTPS in production
   - Keep certificates up to date
   - Enable HSTS if possible

3. **Access Control**
   - Regularly review Supabase RLS policies
   - Monitor authentication logs
   - Implement rate limiting

## Backup Strategy

1. **Database**
   - Enable Supabase automated backups
   - Periodically export data manually
   - Store backups securely

2. **Application Files**
   ```bash
   # Create backup script
   sudo nano /usr/local/bin/backup-gerrbill.sh
   ```

   ```bash
   #!/bin/bash
   BACKUP_DIR="/var/backups/gerrbill"
   mkdir -p $BACKUP_DIR
   tar -czf $BACKUP_DIR/gerrbill-$(date +%Y%m%d).tar.gz /var/www/gerrbill
   find $BACKUP_DIR -type f -mtime +30 -delete
   ```

   ```bash
   sudo chmod +x /usr/local/bin/backup-gerrbill.sh
   # Add to crontab for automated backups
   sudo crontab -e
   # Add: 0 2 * * * /usr/local/bin/backup-gerrbill.sh
   ```