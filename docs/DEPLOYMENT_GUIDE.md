# 🚀 GingerlyAI Deployment Guide

Complete deployment guide for backend API and mobile app across different platforms.

---

## 📋 **Table of Contents**

1. [Backend Deployment](#backend-deployment)
2. [Frontend/Mobile Deployment](#frontend-mobile-deployment)
3. [Database Setup](#database-setup)
4. [SSL/HTTPS Configuration](#ssl-https-configuration)
5. [Monitoring & Logging](#monitoring--logging)

---

## 🔧 **Backend Deployment**

### **Option 1: Heroku (Easiest)**

#### **Prerequisites:**
- Heroku account (free tier available)
- Heroku CLI installed

#### **Steps:**

```bash
# 1. Login to Heroku
heroku login

# 2. Create new app
heroku create gingerlyai-api

# 3. Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# 4. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_ACCESS_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
heroku config:set JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
heroku config:set CORS_ORIGIN=https://your-app-domain.com

# 5. Deploy
cd backend
git push heroku main

# 6. Run migrations
heroku run npm run migrate

# 7. Check logs
heroku logs --tail
```

#### **Heroku Configuration:**

Create `backend/Procfile`:
```
web: node src/server.js
```

Create `backend/.herokungineeroku-postbuild` script in package.json:
```json
{
  "scripts": {
    "heroku-postbuild": "npm run migrate"
  }
}
```

---

### **Option 2: DigitalOcean App Platform**

#### **Steps:**

1. **Create App**:
   - Go to DigitalOcean > Apps
   - Click "Create App"
   - Connect GitHub repository

2. **Configure App**:
   - Source: `backend/`
   - Build Command: `npm install`
   - Run Command: `node src/server.js`

3. **Add Database**:
   - Add PostgreSQL database component
   - Note connection string

4. **Environment Variables**:
```
NODE_ENV=production
PORT=3000
DATABASE_URL=${db.DATABASE_URL}
JWT_ACCESS_SECRET=your-secure-secret
JWT_REFRESH_SECRET=your-secure-refresh-secret
CORS_ORIGIN=https://your-domain.com
```

5. **Deploy**:
   - Click "Create Resources"
   - App will auto-deploy on push to main

---

### **Option 3: AWS EC2 (Full Control)**

#### **Steps:**

```bash
# 1. Launch EC2 instance
# - Ubuntu 22.04 LTS
# - t2.micro (free tier)
# - Open ports: 22 (SSH), 80 (HTTP), 443 (HTTPS)

# 2. SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# 5. Setup PostgreSQL
sudo -u postgres psql
CREATE DATABASE gingerlyai_db;
CREATE USER gingerlyai_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE gingerlyai_db TO gingerlyai_user;
\q

# 6. Clone repository
git clone https://github.com/yourusername/gingerlyai.git
cd gingerlyai/backend

# 7. Install dependencies
npm install --production

# 8. Create .env file
nano .env
# Add production environment variables

# 9. Run migrations
npm run migrate

# 10. Install PM2 (process manager)
sudo npm install -g pm2

# 11. Start application
pm2 start src/server.js --name gingerlyai-api

# 12. Setup PM2 to start on boot
pm2 startup
pm2 save

# 13. Setup Nginx as reverse proxy
sudo apt-get install -y nginx

# 14. Configure Nginx
sudo nano /etc/nginx/sites-available/gingerlyai
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name api.gingerlyai.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# 15. Enable site
sudo ln -s /etc/nginx/sites-available/gingerlyai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 16. Setup SSL with Let's Encrypt
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.gingerlyai.com
```

---

### **Option 4: Railway (Modern Alternative)**

#### **Steps:**

1. **Connect Repository**:
   - Go to railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"

2. **Configure**:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node src/server.js`

3. **Add PostgreSQL**:
   - Click "New" > "Database" > "PostgreSQL"
   - Connection string auto-configured

4. **Environment Variables**:
```
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_ACCESS_SECRET=<generate-secure-secret>
JWT_REFRESH_SECRET=<generate-secure-secret>
CORS_ORIGIN=https://your-domain.com
```

5. **Deploy**:
   - Auto-deploys on git push

---

## 📱 **Frontend/Mobile Deployment**

### **Web App (PWA) Deployment**

#### **Option 1: Vercel (Easiest for React)**

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
cd mobile
vercel

# 4. Set environment variables in Vercel dashboard
# REACT_APP_API_URL=https://api.gingerlyai.com/api
```

#### **Option 2: Netlify**

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Deploy
cd mobile
npm run build
netlify deploy --prod --dir=build

# 4. Set environment variables in Netlify dashboard
```

#### **Option 3: AWS S3 + CloudFront**

```bash
# 1. Build app
cd mobile
npm run build

# 2. Install AWS CLI
# Download from aws.amazon.com/cli

# 3. Configure AWS
aws configure

# 4. Create S3 bucket
aws s3 mb s3://gingerlyai-app

# 5. Upload build
aws s3 sync build/ s3://gingerlyai-app --delete

# 6. Configure bucket for static website
aws s3 website s3://gingerlyai-app \
  --index-document index.html \
  --error-document index.html

# 7. Setup CloudFront distribution (optional)
# For HTTPS and CDN
```

---

### **Mobile App Deployment**

#### **Android - Google Play Store**

```bash
# 1. Build production app
cd mobile
npm run build
npx cap sync android

# 2. Open in Android Studio
npx cap open android

# 3. In Android Studio:
#    - Build > Generate Signed Bundle/APK
#    - Create new keystore if needed
#    - Build release AAB (Android App Bundle)

# 4. Upload to Google Play Console
#    - Create app
#    - Upload AAB
#    - Fill in store listing
#    - Submit for review
```

#### **iOS - Apple App Store**

```bash
# 1. Build production app (macOS only)
cd mobile
npm run build
npx cap sync ios

# 2. Open in Xcode
npx cap open ios

# 3. In Xcode:
#    - Select "Any iOS Device (arm64)"
#    - Product > Archive
#    - Window > Organizer
#    - Distribute App > App Store Connect
#    - Upload

# 4. In App Store Connect:
#    - Create app
#    - Fill in app information
#    - Submit for review
```

---

## 💾 **Database Setup**

### **PostgreSQL Production Setup**

#### **Managed Database (Recommended)**

**Heroku Postgres:**
```bash
heroku addons:create heroku-postgresql:mini
```

**DigitalOcean Managed Database:**
- Create database cluster
- Note connection string
- Add to environment variables

**AWS RDS:**
```bash
# Create PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier gingerlyai-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username gingerlyai \
  --master-user-password <secure-password> \
  --allocated-storage 20
```

#### **Self-Hosted PostgreSQL**

```bash
# Install PostgreSQL
sudo apt-get install postgresql

# Create database
sudo -u postgres createdb gingerlyai_production

# Create user
sudo -u postgres createuser gingerlyai_user

# Set password
sudo -u postgres psql
ALTER USER gingerlyai_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE gingerlyai_production TO gingerlyai_user;
```

#### **Database Migrations**

```bash
# Run migrations
npm run migrate

# Or manually
cd backend
node src/migrations/run-migrations.js
```

---

## 🔒 **SSL/HTTPS Configuration**

### **Let's Encrypt (Free SSL)**

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d api.gingerlyai.com

# Auto-renewal
sudo certbot renew --dry-run
```

### **Cloudflare (Free SSL + CDN)**

1. Add domain to Cloudflare
2. Update nameservers
3. Enable "Full SSL/TLS" mode
4. Enable "Always Use HTTPS"
5. Enable "Auto Minify"

---

## 📊 **Monitoring & Logging**

### **Application Monitoring**

#### **Option 1: PM2 (Self-hosted)**

```bash
# Install PM2
npm install -g pm2

# Start with monitoring
pm2 start src/server.js --name api

# View logs
pm2 logs

# View monitoring dashboard
pm2 monit

# Web dashboard
pm2 install pm2-server-monit
```

#### **Option 2: New Relic**

```bash
# Install New Relic
npm install newrelic

# Configure (newrelic.js)
# Add to server.js:
require('newrelic');
```

#### **Option 3: Sentry (Error Tracking)**

```bash
# Install Sentry
npm install @sentry/node

# Configure in server.js:
const Sentry = require('@sentry/node');
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

### **Log Management**

#### **Papertrail (Cloud Logging)**

```bash
# Add remote syslog
# Heroku:
heroku addons:create papertrail

# PM2:
pm2 install pm2-papertrail
pm2 set pm2-papertrail:host logs.papertrailapp.com
pm2 set pm2-papertrail:port 12345
```

---

## 🧪 **Testing Deployment**

### **Health Checks**

```bash
# Test API endpoint
curl https://api.gingerlyai.com/api/health

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.gingerlyai.com/api/predictions

# Load testing
npm install -g artillery
artillery quick --count 10 --num 50 \
  https://api.gingerlyai.com/api/health
```

---

## 📋 **Pre-Deployment Checklist**

### **Backend**
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificate installed
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Error monitoring setup
- [ ] Backup strategy in place
- [ ] Health check endpoint working

### **Frontend**
- [ ] Production build tested
- [ ] API URL pointing to production
- [ ] Analytics configured
- [ ] Error tracking enabled
- [ ] PWA manifest configured
- [ ] Service worker tested
- [ ] Performance optimized
- [ ] SEO meta tags added

### **Mobile**
- [ ] Production build created
- [ ] App icons and splash screens
- [ ] Permissions configured
- [ ] Privacy policy link added
- [ ] Terms of service link added
- [ ] App store listings complete
- [ ] Screenshots prepared
- [ ] Beta testing completed

---

## 🚀 **Quick Deployment (Development to Production)**

```bash
# 1. Backend (Heroku example)
cd backend
git push heroku main
heroku config:set NODE_ENV=production
heroku run npm run migrate

# 2. Frontend (Vercel example)
cd mobile
vercel --prod

# 3. Mobile (Build locally, upload to stores)
npm run build
npx cap sync android
npx cap sync ios
# Upload AAB to Google Play
# Upload to App Store Connect
```

---

*Deployment Guide for GingerlyAI* 🚀

