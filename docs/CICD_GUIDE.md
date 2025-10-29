# 🚀 CI/CD Pipeline Guide

Complete guide for the GingerlyAI CI/CD pipeline using GitHub Actions.

---

## 📋 **Table of Contents**

1. [Overview](#overview)
2. [Pipeline Structure](#pipeline-structure)
3. [Local Verification](#local-verification)
4. [GitHub Actions Workflows](#github-actions-workflows)
5. [Deployment](#deployment)
6. [Troubleshooting](#troubleshooting)

---

## 🔍 **Overview**

The GingerlyAI CI/CD pipeline automatically:
- ✅ Runs tests on every push/PR
- ✅ Checks code quality and security
- ✅ Builds and verifies artifacts
- ✅ Deploys to production (on main branch)
- ✅ Reports coverage and metrics

---

## 🏗️ **Pipeline Structure**

```
┌─────────────────────────────────────────────────────────┐
│                    CODE PUSH/PR                          │
└─────────────┬───────────────────────────────────────────┘
              │
      ┌───────┴───────┐
      │               │
      ▼               ▼
┌──────────┐    ┌──────────┐
│ Backend  │    │ Frontend │
│  Tests   │    │  Tests   │
└────┬─────┘    └────┬─────┘
     │               │
     ▼               ▼
┌──────────┐    ┌──────────┐
│ Coverage │    │  Build   │
│  Report  │    │   App    │
└────┬─────┘    └────┬─────┘
     │               │
     └───────┬───────┘
             │
      ┌──────┴──────┐
      │             │
      ▼             ▼
┌──────────┐  ┌──────────┐
│ Security │  │   Code   │
│   Scan   │  │ Quality  │
└────┬─────┘  └────┬─────┘
     │             │
     └──────┬──────┘
            │
            ▼
   ┌────────────────┐
   │  Deploy (main) │
   └────────────────┘
```

---

## ⚡ **Local Verification**

Before pushing to GitHub, verify builds locally:

### **Full Verification (All Components)**

```bash
node scripts/verify-build.js
```

### **Backend Only**

```bash
node scripts/verify-build.js --component=backend
```

### **Frontend Only**

```bash
node scripts/verify-build.js --component=frontend
```

### **ML Pipeline Only**

```bash
node scripts/verify-build.js --component=ml
```

### **What Gets Checked:**

#### **Backend:**
- ✅ Dependencies install correctly
- ✅ All tests pass
- ✅ Coverage meets 70% threshold
- ✅ Critical files exist
- ✅ No linting errors

#### **Frontend:**
- ✅ Dependencies install correctly
- ✅ Build completes successfully
- ✅ Build size is reasonable (< 50MB)
- ✅ index.html generated
- ✅ Critical files exist

#### **ML Pipeline:**
- ✅ Python dependencies valid
- ✅ Trained model exists
- ✅ Model file has content
- ✅ Data structure is correct
- ✅ Critical Python files exist

---

## 🤖 **GitHub Actions Workflows**

### **Main Workflow: `.github/workflows/ci.yml`**

Runs on every push to `main` or `develop` branches, and on all pull requests.

#### **Jobs:**

1. **backend-test**
   - Runs on: `ubuntu-latest`
   - Services: PostgreSQL 13
   - Steps:
     - Checkout code
     - Setup Node.js 18
     - Install dependencies
     - Create test environment
     - Run tests with coverage
     - Upload coverage to Codecov
     - Run linting

2. **frontend-test**
   - Runs on: `ubuntu-latest`
   - Steps:
     - Checkout code
     - Setup Node.js 18
     - Install dependencies
     - Create test environment
     - Run tests
     - Upload coverage
     - Build production app
     - Check build size

3. **ml-test**
   - Runs on: `ubuntu-latest`
   - Steps:
     - Checkout code
     - Setup Python 3.9
     - Cache pip dependencies
     - Install Python packages
     - Run tests (if available)
     - Validate code style

4. **security-scan**
   - Runs on: `ubuntu-latest`
   - Steps:
     - Run Trivy vulnerability scanner
     - Upload results to GitHub Security

5. **code-quality**
   - Runs on: `ubuntu-latest`
   - Steps:
     - Run ESLint on backend
     - Run ESLint on frontend
     - Generate quality reports

6. **build-deploy**
   - Runs on: `ubuntu-latest`
   - Condition: Only on `main` branch
   - Dependencies: All tests must pass
   - Steps:
     - Build backend
     - Build frontend
     - Create deployment artifact
     - Upload artifact

7. **notify**
   - Runs on: `ubuntu-latest`
   - Condition: Always runs
   - Steps:
     - Notify on success/failure

---

## 🔐 **Environment Variables**

### **Required Secrets (GitHub Settings)**

Go to: Repository → Settings → Secrets and variables → Actions

```bash
# Backend
JWT_ACCESS_SECRET=<your-secret>
JWT_REFRESH_SECRET=<your-secret>
DATABASE_URL=<production-database-url>

# Deployment
DEPLOY_KEY=<ssh-key-for-deployment>
DEPLOY_HOST=<deployment-server>
DEPLOY_USER=<deployment-user>

# Optional
CODECOV_TOKEN=<codecov-token>
SENTRY_DSN=<sentry-dsn>
```

### **Environment Files in CI**

#### **Backend (.env)**
```env
NODE_ENV=test
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gingerlyai_test
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=test-secret
JWT_REFRESH_SECRET=test-refresh-secret
```

#### **Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_ENV=test
```

---

## 📊 **Build Status Badges**

Add to README.md:

```markdown
![CI/CD](https://github.com/yourusername/GingerlyAI/workflows/CI/CD%20Pipeline/badge.svg)
![Coverage](https://codecov.io/gh/yourusername/GingerlyAI/branch/main/graph/badge.svg)
```

---

## 🚀 **Deployment**

### **Automatic Deployment (Main Branch)**

When code is pushed to `main` and all tests pass:
1. Build artifacts are created
2. Artifacts are uploaded to GitHub
3. Deployment workflow triggers (if configured)

### **Manual Deployment**

#### **Option 1: GitHub Actions Manual Trigger**

```yaml
# .github/workflows/deploy.yml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production
```

#### **Option 2: Command Line**

```bash
# Download artifact
gh run download <run-id>

# Deploy backend
cd backend
npm run deploy:production

# Deploy frontend
cd mobile
npm run deploy:production
```

---

## 📈 **Monitoring CI/CD**

### **View Pipeline Status**

```bash
# List recent workflow runs
gh run list

# View specific run
gh run view <run-id>

# Watch run in real-time
gh run watch

# View logs
gh run view <run-id> --log
```

### **Coverage Reports**

- **Codecov**: https://codecov.io/gh/yourusername/GingerlyAI
- **Local**: `backend/coverage/lcov-report/index.html`

### **Build Artifacts**

Access from: Repository → Actions → Workflow run → Artifacts

---

## ⚠️ **Troubleshooting**

### **Tests Failing in CI but Pass Locally**

**Causes:**
- Environment differences
- Missing environment variables
- Database not initialized
- Timing issues

**Solutions:**
```bash
# Reproduce CI environment locally
export CI=true
export NODE_ENV=test

# Run with CI flags
npm run test:ci
```

---

### **Build Failing: "npm ci" Error**

**Cause**: package-lock.json out of sync

**Solution:**
```bash
# Regenerate lock file
rm package-lock.json
npm install
git add package-lock.json
git commit -m "fix: Update package-lock.json"
```

---

### **Coverage Below Threshold**

**Cause**: Code coverage < 70%

**Solution:**
```bash
# Check coverage locally
npm run test:coverage

# View detailed report
open coverage/lcov-report/index.html

# Add missing tests
# Update jest.config.js thresholds if needed (temporarily)
```

---

### **Security Vulnerabilities Found**

**Cause**: Trivy scan found vulnerabilities

**Solution:**
```bash
# Update dependencies
npm audit fix

# Update specific package
npm update <package-name>

# Check again
npm audit
```

---

### **Deployment Artifact Too Large**

**Cause**: Build includes unnecessary files

**Solution:**
```yaml
# Update .github/workflows/ci.yml
- name: Create deployment artifact
  run: |
    tar -czf gingerlyai.tar.gz \
      --exclude='node_modules' \
      --exclude='.git' \
      --exclude='*.log' \
      --exclude='coverage' \
      --exclude='test-results' \
      .
```

---

### **PostgreSQL Connection Failed**

**Cause**: Database service not ready

**Solution:**
```yaml
# Increase health check retries in ci.yml
services:
  postgres:
    options: >-
      --health-retries 10
      --health-interval 5s
      --health-timeout 10s
```

---

## 🔄 **CI/CD Workflow Examples**

### **Feature Branch Workflow**

```bash
# 1. Create feature branch
git checkout -b feature/new-endpoint

# 2. Make changes
# ... code changes ...

# 3. Test locally
node scripts/verify-build.js

# 4. Commit and push
git add .
git commit -m "feat: Add new endpoint"
git push origin feature/new-endpoint

# 5. Create PR
gh pr create --title "Add new endpoint" --body "Description"

# 6. CI runs automatically
# - All tests run
# - Coverage checked
# - Security scan
# - Code quality check

# 7. Fix any issues
# ... fix code ...
git add .
git commit -m "fix: Address CI issues"
git push

# 8. Merge when green
gh pr merge --squash
```

---

### **Hotfix Workflow**

```bash
# 1. Create hotfix branch from main
git checkout -b hotfix/critical-bug main

# 2. Fix the issue
# ... code fix ...

# 3. Verify locally
node scripts/verify-build.js

# 4. Push directly to main (emergency)
git add .
git commit -m "fix: Critical bug fix"
git push origin main

# 5. CI runs and auto-deploys
# Monitor deployment logs
```

---

## 📋 **CI/CD Checklist**

### **Before Pushing**

- [ ] All tests pass locally
- [ ] Build verification successful
- [ ] No linting errors
- [ ] Coverage meets threshold
- [ ] Environment variables configured
- [ ] Commit message follows convention

### **After Pushing**

- [ ] CI pipeline starts
- [ ] All jobs pass
- [ ] Coverage report updated
- [ ] No security vulnerabilities
- [ ] Build artifacts created
- [ ] Deployment successful (if main branch)

---

## 🎯 **Performance Targets**

| Job | Target Time | Acceptable | Slow |
|-----|-------------|------------|------|
| **Backend Tests** | < 1 min | < 2 min | > 2 min |
| **Frontend Tests** | < 2 min | < 5 min | > 5 min |
| **Frontend Build** | < 3 min | < 5 min | > 5 min |
| **ML Tests** | < 2 min | < 5 min | > 5 min |
| **Security Scan** | < 1 min | < 3 min | > 3 min |
| **Total Pipeline** | < 10 min | < 15 min | > 15 min |

---

## 🔧 **Optimization Tips**

### **Cache Dependencies**

```yaml
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-npm-
```

### **Run Jobs in Parallel**

```yaml
jobs:
  backend-test:
    # runs independently
  
  frontend-test:
    # runs independently
  
  deploy:
    needs: [backend-test, frontend-test]
    # waits for both
```

### **Fail Fast**

```yaml
strategy:
  fail-fast: true
```

---

## 📚 **Additional Resources**

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Codecov Documentation](https://docs.codecov.com/)
- [Jest CI Configuration](https://jestjs.io/docs/configuration#ci-boolean)
- [Trivy Scanner](https://github.com/aquasecurity/trivy)

---

*CI/CD Pipeline Guide for GingerlyAI* 🚀

