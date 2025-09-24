# 🚀 Deployment Guide

This guide covers deploying GingerlyAI to various environments, from development to production.

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- Python 3.9+ (for ML training)
- Git
- Docker (optional)

## 🌍 Environment Overview

### Development
- Local development with hot reload
- SQLite for quick setup
- Local file storage

### Staging
- Production-like environment
- PostgreSQL database
- Cloud storage (optional)

### Production
- Optimized for performance and security
- PostgreSQL with backups
- CDN for static assets
- Monitoring and logging

## 🔧 Backend Deployment

### Local Development

1. **Clone and Setup**
   ```bash
   git clone https://github.com/yourusername/GingerlyAI.git
   cd GingerlyAI/backend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your settings:
   ```env
   NODE_ENV=development
   PORT=3000
   
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=gingerlyai_dev
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-refresh-secret
   
   # File Storage
   UPLOAD_PATH=uploads/
   MODEL_STORAGE_PATH=models/
   ```

3. **Database Setup**
   ```bash
   # Create database
   createdb gingerlyai_dev
   
   # Run migrations
   npm run migrate
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

### Production Deployment

#### Option 1: Traditional Server (Ubuntu/CentOS)

1. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install PostgreSQL
   sudo apt install -y postgresql postgresql-contrib
   
   # Install PM2 for process management
   sudo npm install -g pm2
   ```

2. **Application Setup**
   ```bash
   # Clone repository
   git clone https://github.com/yourusername/GingerlyAI.git
   cd GingerlyAI/backend
   
   # Install dependencies
   npm ci --only=production
   
   # Setup environment
   cp env.example .env
   # Edit .env with production values
   
   # Setup database
   sudo -u postgres createdb gingerlyai_prod
   npm run migrate
   ```

3. **Process Management**
   ```bash
   # Start with PM2
   pm2 start src/server.js --name "gingerlyai-backend"
   pm2 startup
   pm2 save
   ```

4. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
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
   }
   ```

#### Option 2: Docker Deployment

1. **Dockerfile** (backend/Dockerfile)
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   # Copy package files
   COPY package*.json ./
   RUN npm ci --only=production
   
   # Copy source code
   COPY . .
   
   # Create non-root user
   RUN addgroup -g 1001 -S nodejs
   RUN adduser -S gingerlyai -u 1001
   
   # Create directories
   RUN mkdir -p uploads models logs
   RUN chown -R gingerlyai:nodejs /app
   
   USER gingerlyai
   
   EXPOSE 3000
   
   CMD ["node", "src/server.js"]
   ```

2. **Docker Compose** (docker-compose.yml)
   ```yaml
   version: '3.8'
   
   services:
     backend:
       build: ./backend
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
         - DB_HOST=db
         - DB_NAME=gingerlyai
         - DB_USER=postgres
         - DB_PASSWORD=secure_password
       depends_on:
         - db
       volumes:
         - ./uploads:/app/uploads
         - ./models:/app/models
   
     db:
       image: postgres:13
       environment:
         - POSTGRES_DB=gingerlyai
         - POSTGRES_USER=postgres
         - POSTGRES_PASSWORD=secure_password
       volumes:
         - postgres_data:/var/lib/postgresql/data
   
   volumes:
     postgres_data:
   ```

3. **Deploy with Docker**
   ```bash
   # Build and start
   docker-compose up -d
   
   # Run migrations
   docker-compose exec backend npm run migrate
   ```

#### Option 3: Cloud Platforms

**Heroku**
```bash
# Install Heroku CLI
# Login and create app
heroku login
heroku create gingerlyai-backend

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main

# Run migrations
heroku run npm run migrate
```

**Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

**DigitalOcean App Platform**
- Connect GitHub repository
- Configure build and run commands
- Add PostgreSQL database
- Set environment variables

## 📱 Mobile App Deployment

### Development Build

```bash
cd mobile
npm install
npm start
```

### Production Build

1. **Web Build**
   ```bash
   npm run build
   ```

2. **iOS Build**
   ```bash
   # Add iOS platform
   npx cap add ios
   
   # Build web assets
   npm run build
   
   # Sync with native
   npx cap sync ios
   
   # Open in Xcode
   npx cap open ios
   ```

3. **Android Build**
   ```bash
   # Add Android platform
   npx cap add android
   
   # Build web assets
   npm run build
   
   # Sync with native
   npx cap sync android
   
   # Open in Android Studio
   npx cap open android
   ```

### Progressive Web App (PWA)

Deploy the built web assets to any static hosting:

**Netlify**
```bash
# Build locally
npm run build

# Deploy
npx netlify deploy --prod --dir=build
```

**Vercel**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**GitHub Pages**
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts
"deploy": "gh-pages -d build"

# Deploy
npm run deploy
```

## 🤖 ML Pipeline Deployment

### Model Training Environment

1. **Setup Training Server**
   ```bash
   # Install Python and dependencies
   python -m venv venv
   source venv/bin/activate
   pip install -r ml-training/requirements.txt
   ```

2. **GPU Support (Optional)**
   ```bash
   # Install CUDA drivers
   # Install cuDNN
   # Install tensorflow-gpu
   pip install tensorflow-gpu
   ```

3. **Run Training Pipeline**
   ```bash
   cd ml-training
   python data_preprocessing.py
   python model_training.py
   python model_evaluation.py
   python model_export.py
   ```

### Model Serving

Models are served through the backend API. Exported TensorFlow.js models are stored in the `models/` directory and served as static files.

## 🔐 Security Configuration

### SSL/TLS Setup

1. **Let's Encrypt with Certbot**
   ```bash
   # Install certbot
   sudo apt install certbot python3-certbot-nginx
   
   # Get certificate
   sudo certbot --nginx -d your-domain.com
   
   # Auto-renewal
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

2. **Update Nginx Configuration**
   ```nginx
   server {
       listen 443 ssl http2;
       server_name your-domain.com;
       
       ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
       
       # SSL configuration
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
       ssl_prefer_server_ciphers off;
       
       location / {
           proxy_pass http://localhost:3000;
           # ... other proxy settings
       }
   }
   ```

### Firewall Configuration

```bash
# UFW setup
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 📊 Monitoring and Logging

### Application Monitoring

1. **PM2 Monitoring**
   ```bash
   # Monitor processes
   pm2 monit
   
   # View logs
   pm2 logs
   
   # Reload application
   pm2 reload gingerlyai-backend
   ```

2. **Log Management**
   ```bash
   # Log rotation
   sudo apt install logrotate
   
   # Create logrotate config
   sudo tee /etc/logrotate.d/gingerlyai << EOF
   /path/to/app/logs/*.log {
       daily
       missingok
       rotate 14
       compress
       delaycompress
       notifempty
       create 0644 gingerlyai gingerlyai
   }
   EOF
   ```

### Database Monitoring

```bash
# PostgreSQL monitoring
sudo apt install postgresql-contrib

# Enable logging
sudo nano /etc/postgresql/13/main/postgresql.conf
# Uncomment and set:
# log_statement = 'all'
# log_min_duration_statement = 1000

# Restart PostgreSQL
sudo systemctl restart postgresql
```

## 🔄 Backup Strategy

### Database Backups

```bash
# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups/postgres"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="gingerlyai_prod"

# Create backup
pg_dump -h localhost -U postgres $DB_NAME > $BACKUP_DIR/backup_$TIMESTAMP.sql

# Compress
gzip $BACKUP_DIR/backup_$TIMESTAMP.sql

# Remove old backups (keep 30 days)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

# Upload to cloud storage (optional)
# aws s3 cp $BACKUP_DIR/backup_$TIMESTAMP.sql.gz s3://your-backup-bucket/
```

### File Backups

```bash
# Backup uploads and models
rsync -av --delete /path/to/uploads/ /backups/uploads/
rsync -av --delete /path/to/models/ /backups/models/
```

## 🚀 Continuous Deployment

### GitHub Actions Deployment

The included CI/CD pipeline automatically deploys to staging/production on push to specific branches.

### Manual Deployment Script

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Starting deployment..."

# Pull latest code
git pull origin main

# Backend deployment
cd backend
npm ci --only=production
npm run migrate

# Restart services
pm2 reload gingerlyai-backend

# Frontend deployment (if needed)
cd ../mobile
npm ci
npm run build

echo "✅ Deployment completed!"
```

## 📞 Support

For deployment issues:
- Check logs: `pm2 logs` or `docker-compose logs`
- Review environment variables
- Verify database connections
- Check firewall settings
- Consult the troubleshooting section in README.md

---

**Deploy with confidence! 🌱🚀**
