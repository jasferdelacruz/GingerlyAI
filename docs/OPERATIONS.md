# 🛠️ GingerlyAI Operations Guide

## 📋 Overview

This guide covers the operational aspects of running GingerlyAI in production, including deployment, monitoring, maintenance, backup procedures, troubleshooting, and disaster recovery.

---

## 🚀 Production Deployment

### **Infrastructure Requirements**

#### **Minimum Server Specifications**
- **CPU**: 2 vCPUs (4 recommended)
- **RAM**: 4GB (8GB recommended)
- **Storage**: 50GB SSD (100GB recommended)
- **Network**: 1Gbps connection
- **OS**: Ubuntu 20.04 LTS or CentOS 8

#### **Database Requirements**
- **PostgreSQL**: Version 12+
- **CPU**: 2 vCPUs
- **RAM**: 4GB
- **Storage**: 100GB SSD with daily backups

#### **Load Balancer Requirements**
- **Nginx**: Latest stable version
- **SSL**: TLS 1.3 certificates
- **CDN**: CloudFlare or AWS CloudFront

### **Production Environment Setup**

#### **1. Server Preparation**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL 14
sudo apt install postgresql postgresql-contrib

# Install Nginx
sudo apt install nginx

# Install PM2 for process management
sudo npm install -g pm2

# Install certbot for SSL
sudo apt install certbot python3-certbot-nginx
```

#### **2. Database Setup**
```bash
# Switch to postgres user
sudo -u postgres psql

-- Create database and user
CREATE DATABASE gingerlyai_prod;
CREATE USER gingerlyai WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE gingerlyai_prod TO gingerlyai;
\q

# Configure PostgreSQL for production
sudo nano /etc/postgresql/14/main/postgresql.conf
# Set: shared_buffers = 1GB, effective_cache_size = 3GB

sudo nano /etc/postgresql/14/main/pg_hba.conf
# Add: host gingerlyai_prod gingerlyai 127.0.0.1/32 md5
```

#### **3. Application Deployment**
```bash
# Create application directory
sudo mkdir -p /var/www/gingerlyai
sudo chown $USER:$USER /var/www/gingerlyai

# Clone repository
cd /var/www/gingerlyai
git clone https://github.com/yourusername/gingerlyai.git .

# Install backend dependencies
cd backend
npm ci --production

# Create production environment file
cp env.example .env
nano .env
```

#### **4. Environment Configuration**
```bash
# /var/www/gingerlyai/backend/.env
NODE_ENV=production
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gingerlyai_prod
DB_USER=gingerlyai
DB_PASSWORD=secure_password_here

# JWT Secrets (generate secure random strings)
JWT_SECRET=your-256-bit-secret-key-here
JWT_REFRESH_SECRET=your-256-bit-refresh-secret-here

# File paths
UPLOAD_PATH=/var/www/gingerlyai/uploads
MODEL_STORAGE_PATH=/var/www/gingerlyai/models

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# CORS
CORS_ORIGIN=https://yourdomain.com
```

#### **5. Process Management with PM2**
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'gingerlyai-backend',
    script: 'src/server.js',
    cwd: '/var/www/gingerlyai/backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/gingerlyai/error.log',
    out_file: '/var/log/gingerlyai/out.log',
    log_file: '/var/log/gingerlyai/combined.log',
    time: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G'
  }]
}
EOF

# Create log directory
sudo mkdir -p /var/log/gingerlyai
sudo chown $USER:$USER /var/log/gingerlyai

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

#### **6. Nginx Configuration**
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/gingerlyai

# Add configuration:
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        alias /var/www/gingerlyai/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /models/ {
        alias /var/www/gingerlyai/models/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/gingerlyai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 📊 Monitoring & Alerting

### **System Monitoring Setup**

#### **1. Server Monitoring**
```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# Create monitoring script
cat > /opt/gingerlyai/monitor.sh << 'EOF'
#!/bin/bash

# System metrics
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.1f"), $3/$2 * 100.0}')
DISK_USAGE=$(df -h / | awk 'NR==2{printf "%s", $5}' | sed 's/%//')

# Application metrics
APP_STATUS=$(pm2 jlist | jq '.[0].pm2_env.status' | tr -d '"')
APP_RESTARTS=$(pm2 jlist | jq '.[0].pm2_env.restart_time')

# Database metrics
DB_CONNECTIONS=$(sudo -u postgres psql -d gingerlyai_prod -t -c "SELECT count(*) FROM pg_stat_activity;")

# Log metrics
echo "$(date): CPU:${CPU_USAGE}% MEM:${MEMORY_USAGE}% DISK:${DISK_USAGE}% APP:${APP_STATUS} RESTARTS:${APP_RESTARTS} DB_CONN:${DB_CONNECTIONS}" >> /var/log/gingerlyai/metrics.log

# Alerts
if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
    echo "HIGH CPU USAGE: ${CPU_USAGE}%" | mail -s "GingerlyAI Alert" admin@yourdomain.com
fi

if (( $(echo "$MEMORY_USAGE > 85" | bc -l) )); then
    echo "HIGH MEMORY USAGE: ${MEMORY_USAGE}%" | mail -s "GingerlyAI Alert" admin@yourdomain.com
fi
EOF

chmod +x /opt/gingerlyai/monitor.sh

# Add to crontab
echo "*/5 * * * * /opt/gingerlyai/monitor.sh" | crontab -
```

#### **2. Application Monitoring**
```javascript
// Add to server.js for health monitoring
app.get('/health/detailed', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    version: process.version,
    environment: process.env.NODE_ENV
  };

  try {
    // Database health check
    await sequelize.authenticate();
    health.database = 'Connected';
  } catch (error) {
    health.database = 'Disconnected';
    health.status = 'Degraded';
  }

  // Check disk space
  const stats = require('fs').statSync(process.env.UPLOAD_PATH || 'uploads');
  health.storage = {
    uploadsPath: process.env.UPLOAD_PATH || 'uploads',
    available: true
  };

  res.json(health);
});
```

#### **3. Log Management**
```bash
# Install logrotate for log management
sudo nano /etc/logrotate.d/gingerlyai

# Add configuration:
/var/log/gingerlyai/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}

# Test logrotate
sudo logrotate -d /etc/logrotate.d/gingerlyai
```

### **Performance Monitoring**

#### **Application Performance Metrics**
```javascript
// Add to middleware for request timing
const performanceMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('Performance', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
    
    // Alert on slow requests
    if (duration > 5000) {
      logger.warn('Slow Request', { url: req.url, duration });
    }
  });
  
  next();
};
```

---

## 🔄 Backup & Recovery

### **Database Backup Strategy**

#### **1. Automated Daily Backups**
```bash
# Create backup script
cat > /opt/gingerlyai/backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/var/backups/gingerlyai"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="gingerlyai_prod"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
sudo -u postgres pg_dump $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Application files backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz \
    /var/www/gingerlyai/uploads \
    /var/www/gingerlyai/models \
    /var/www/gingerlyai/backend/.env

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

# Log backup completion
echo "$(date): Backup completed - db_backup_$DATE.sql.gz" >> /var/log/gingerlyai/backup.log
EOF

chmod +x /opt/gingerlyai/backup.sh

# Schedule daily backups at 2 AM
echo "0 2 * * * /opt/gingerlyai/backup.sh" | sudo crontab -
```

#### **2. Cloud Backup Integration**
```bash
# Install AWS CLI for S3 backups
sudo apt install awscli

# Configure AWS credentials
aws configure

# Enhanced backup script with cloud storage
cat > /opt/gingerlyai/cloud-backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/var/backups/gingerlyai"
DATE=$(date +%Y%m%d_%H%M%S)
S3_BUCKET="gingerlyai-backups"

# Local backup
/opt/gingerlyai/backup.sh

# Upload to S3
aws s3 cp $BACKUP_DIR/db_backup_$DATE.sql.gz s3://$S3_BUCKET/database/
aws s3 cp $BACKUP_DIR/app_backup_$DATE.tar.gz s3://$S3_BUCKET/application/

# Verify upload
if aws s3 ls s3://$S3_BUCKET/database/db_backup_$DATE.sql.gz; then
    echo "$(date): Cloud backup successful" >> /var/log/gingerlyai/backup.log
else
    echo "$(date): Cloud backup failed" >> /var/log/gingerlyai/backup.log
    echo "Cloud backup failed for GingerlyAI" | mail -s "Backup Alert" admin@yourdomain.com
fi
EOF
```

### **Disaster Recovery Procedures**

#### **1. Database Recovery**
```bash
# Stop application
pm2 stop gingerlyai-backend

# Restore database from backup
gunzip -c /var/backups/gingerlyai/db_backup_YYYYMMDD_HHMMSS.sql.gz | sudo -u postgres psql gingerlyai_prod

# Start application
pm2 start gingerlyai-backend

# Verify recovery
curl -s http://localhost:3000/api/health | jq '.status'
```

#### **2. Full System Recovery**
```bash
# 1. Restore application files
cd /var/www/gingerlyai
tar -xzf /var/backups/gingerlyai/app_backup_YYYYMMDD_HHMMSS.tar.gz

# 2. Restore database (as above)

# 3. Reinstall dependencies
cd backend
npm ci --production

# 4. Restart services
pm2 restart all
sudo systemctl restart nginx

# 5. Verify all services
pm2 status
sudo nginx -t
curl -s https://yourdomain.com/api/health
```

---

## 🔧 Maintenance Procedures

### **Regular Maintenance Tasks**

#### **Weekly Maintenance Checklist**
```bash
# 1. System updates
sudo apt update && sudo apt list --upgradable

# 2. Security updates
sudo unattended-upgrades -d

# 3. Log rotation and cleanup
sudo logrotate -f /etc/logrotate.d/gingerlyai

# 4. Database maintenance
sudo -u postgres psql gingerlyai_prod -c "VACUUM ANALYZE;"

# 5. Check SSL certificate expiry
sudo certbot certificates

# 6. Verify backup integrity
ls -la /var/backups/gingerlyai/

# 7. Performance review
tail -100 /var/log/gingerlyai/metrics.log

# 8. Security scan
sudo apt install chkrootkit
sudo chkrootkit
```

#### **Monthly Maintenance Tasks**
```bash
# 1. Dependency updates (test in staging first)
cd /var/www/gingerlyai/backend
npm audit
npm outdated

# 2. Database optimization
sudo -u postgres psql gingerlyai_prod -c "
  SELECT schemaname,tablename,attname,n_distinct,correlation 
  FROM pg_stats 
  WHERE schemaname = 'public' 
  ORDER BY n_distinct DESC;"

# 3. Storage cleanup
find /var/log -name "*.log" -mtime +30 -delete
find /tmp -name "tmp*" -mtime +7 -delete

# 4. Security audit
sudo lynis audit system

# 5. Performance baseline
ab -n 1000 -c 10 http://localhost:3000/api/health
```

### **Application Updates**

#### **Zero-Downtime Deployment**
```bash
# 1. Create deployment script
cat > /opt/gingerlyai/deploy.sh << 'EOF'
#!/bin/bash

REPO_DIR="/var/www/gingerlyai"
BACKUP_DIR="/opt/gingerlyai/rollback"
DATE=$(date +%Y%m%d_%H%M%S)

# Create rollback point
cp -r $REPO_DIR $BACKUP_DIR/backup_$DATE

# Pull latest changes
cd $REPO_DIR
git pull origin main

# Install dependencies
cd backend
npm ci --production

# Run migrations
npm run migrate

# Reload application (zero downtime with cluster mode)
pm2 reload gingerlyai-backend

# Verify deployment
sleep 10
if curl -f -s http://localhost:3000/api/health; then
    echo "Deployment successful"
    # Clean old rollback points
    find $BACKUP_DIR -name "backup_*" -mtime +7 -exec rm -rf {} \;
else
    echo "Deployment failed, rolling back"
    pm2 stop gingerlyai-backend
    rm -rf $REPO_DIR
    mv $BACKUP_DIR/backup_$DATE $REPO_DIR
    pm2 start gingerlyai-backend
fi
EOF

chmod +x /opt/gingerlyai/deploy.sh
```

---

## 🚨 Troubleshooting Guide

### **Common Issues & Solutions**

#### **1. Application Won't Start**
```bash
# Check logs
pm2 logs gingerlyai-backend

# Common fixes:
# - Check environment variables
cat /var/www/gingerlyai/backend/.env

# - Verify database connection
sudo -u postgres psql gingerlyai_prod -c "SELECT 1;"

# - Check file permissions
ls -la /var/www/gingerlyai/

# - Verify Node.js version
node --version
```

#### **2. High Memory Usage**
```bash
# Check process memory
pm2 monit

# Check for memory leaks
node --inspect /var/www/gingerlyai/backend/src/server.js

# Restart if necessary
pm2 restart gingerlyai-backend
```

#### **3. Database Connection Issues**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check active connections
sudo -u postgres psql gingerlyai_prod -c "
  SELECT count(*) as connections, state 
  FROM pg_stat_activity 
  WHERE datname = 'gingerlyai_prod' 
  GROUP BY state;"

# Check connection limits
sudo -u postgres psql -c "SHOW max_connections;"
```

#### **4. SSL Certificate Issues**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew --dry-run

# Test SSL configuration
sudo nginx -t
```

### **Emergency Procedures**

#### **Service Recovery Steps**
1. **Immediate Response**
   - Check service status: `pm2 status`
   - Review recent logs: `pm2 logs --lines 50`
   - Check system resources: `htop`

2. **Quick Fixes**
   - Restart application: `pm2 restart gingerlyai-backend`
   - Restart database: `sudo systemctl restart postgresql`
   - Restart web server: `sudo systemctl restart nginx`

3. **Escalation**
   - If quick fixes fail, initiate rollback procedure
   - Contact development team
   - Document incident in `/var/log/gingerlyai/incidents.log`

---

## 📈 Performance Optimization

### **Database Optimization**

#### **Query Performance Tuning**
```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();

-- Analyze slow queries
SELECT query, mean_time, calls, rows 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Create indexes for common queries
CREATE INDEX CONCURRENTLY idx_predictions_user_created 
ON predictions(userId, createdAt DESC);

CREATE INDEX CONCURRENTLY idx_predictions_disease 
ON predictions(topPrediction) 
WHERE confidence > 0.8;
```

#### **Connection Pool Optimization**
```javascript
// Optimize Sequelize connection pool
const sequelize = new Sequelize(database, username, password, {
  host,
  dialect: 'postgres',
  pool: {
    max: 20,        // Maximum connections
    min: 5,         // Minimum connections
    acquire: 30000, // Maximum time to get connection
    idle: 10000,    // Maximum idle time
    evict: 1000     // Check for idle connections interval
  },
  logging: false
});
```

### **Application Performance**

#### **Caching Strategy**
```javascript
// Install Redis for caching
// sudo apt install redis-server

const redis = require('redis');
const client = redis.createClient();

// Cache middleware
const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cached = await client.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    } catch (error) {
      console.error('Cache error:', error);
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      client.setex(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };
    
    next();
  };
};

// Use caching for heavy endpoints
app.get('/api/remedies', cacheMiddleware(3600), getRemedies);
```

---

## 🔐 Security Operations

### **Security Monitoring**

#### **Log Analysis for Security Events**
```bash
# Create security monitoring script
cat > /opt/gingerlyai/security-monitor.sh << 'EOF'
#!/bin/bash

LOG_FILE="/var/log/gingerlyai/combined.log"
SECURITY_LOG="/var/log/gingerlyai/security.log"

# Monitor for suspicious activities
grep -i "unauthorized\|forbidden\|failed.*login\|suspicious" $LOG_FILE >> $SECURITY_LOG

# Monitor for brute force attempts
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -20 > /tmp/top_ips.txt

# Alert on high traffic from single IP
while read count ip; do
    if [ $count -gt 1000 ]; then
        echo "$(date): High traffic from IP $ip ($count requests)" >> $SECURITY_LOG
        echo "Potential attack from IP $ip" | mail -s "Security Alert" admin@yourdomain.com
    fi
done < /tmp/top_ips.txt
EOF

chmod +x /opt/gingerlyai/security-monitor.sh

# Run every hour
echo "0 * * * * /opt/gingerlyai/security-monitor.sh" | crontab -
```

#### **Automated Security Updates**
```bash
# Configure unattended upgrades
sudo nano /etc/apt/apt.conf.d/50unattended-upgrades

# Enable automatic security updates
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
};

Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
```

---

## 📞 Support & Escalation

### **Incident Response Procedures**

#### **Severity Levels**
- **Critical (P1)**: Service completely down
- **High (P2)**: Major functionality impaired
- **Medium (P3)**: Minor functionality issues
- **Low (P4)**: Cosmetic or enhancement requests

#### **Escalation Matrix**
```
P1 (Critical): Immediate notification → On-call engineer → Team lead
P2 (High): 30 minutes → Primary engineer → Team lead
P3 (Medium): 2 hours → Next available engineer
P4 (Low): Next business day → Queue for sprint planning
```

#### **Contact Information**
```bash
# Create emergency contact file
cat > /opt/gingerlyai/emergency-contacts.txt << 'EOF'
Primary On-Call: +1-XXX-XXX-XXXX
Team Lead: +1-XXX-XXX-XXXX
DevOps: +1-XXX-XXX-XXXX
Infrastructure: +1-XXX-XXX-XXXX

Email Alerts: alerts@yourdomain.com
Slack Channel: #gingerlyai-alerts
PagerDuty: https://yourdomain.pagerduty.com
EOF
```

---

This operations guide provides comprehensive coverage of all operational aspects required to maintain a production GingerlyAI deployment reliably and securely.
