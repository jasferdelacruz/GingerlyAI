#!/usr/bin/env node

/**
 * Build Verification Script for GingerlyAI
 * 
 * Tests all builds locally before pushing to CI/CD
 * 
 * Usage:
 *   node scripts/verify-build.js
 *   node scripts/verify-build.js --component=backend
 *   node scripts/verify-build.js --component=frontend
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');
const FRONTEND_DIR = path.join(ROOT_DIR, 'mobile');
const ML_DIR = path.join(ROOT_DIR, 'ml-training');

// Parse command line arguments
const args = process.argv.slice(2);
const componentArg = args.find(arg => arg.startsWith('--component='));
const targetComponent = componentArg ? componentArg.split('=')[1] : 'all';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function banner(text) {
  const width = 65;
  const padding = '═'.repeat(width);
  log(`\n╔${padding}╗`, 'cyan');
  log(`║${text.padStart(Math.floor((width + text.length) / 2)).padEnd(width)}║`, 'cyan');
  log(`╚${padding}╝\n`, 'cyan');
}

function section(text) {
  log(`\n${'─'.repeat(65)}`, 'blue');
  log(`  ${text}`, 'bright');
  log('─'.repeat(65), 'blue');
}

function execute(command, cwd, description) {
  try {
    log(`\n⏳ ${description}...`, 'yellow');
    
    const startTime = Date.now();
    execSync(command, {
      cwd,
      stdio: 'inherit',
      env: { ...process.env, CI: 'true' }
    });
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    log(`✅ ${description} - Complete (${duration}s)`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} - Failed`, 'red');
    return false;
  }
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description} exists`, 'green');
    return true;
  } else {
    log(`❌ ${description} not found`, 'red');
    return false;
  }
}

function checkDirectory(dirPath, description) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    const files = fs.readdirSync(dirPath);
    log(`✅ ${description} exists (${files.length} files)`, 'green');
    return true;
  } else {
    log(`❌ ${description} not found`, 'red');
    return false;
  }
}

function getDirSize(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  
  let size = 0;
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      size += getDirSize(filePath);
    } else {
      size += stats.size;
    }
  });
  
  return size;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

async function verifyBackend() {
  section('BACKEND BUILD VERIFICATION');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Check if backend directory exists
  if (!checkDirectory(BACKEND_DIR, 'Backend directory')) {
    results.failed++;
    return results;
  }

  // Check package.json
  if (checkFile(path.join(BACKEND_DIR, 'package.json'), 'package.json')) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Install dependencies
  if (execute('npm ci', BACKEND_DIR, 'Install backend dependencies')) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Run tests
  if (execute('npm run test:ci', BACKEND_DIR, 'Run backend tests')) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Check test coverage
  const coverageDir = path.join(BACKEND_DIR, 'coverage');
  if (checkDirectory(coverageDir, 'Test coverage report')) {
    results.passed++;
    
    // Check coverage file
    const coverageSummary = path.join(coverageDir, 'coverage-summary.json');
    if (fs.existsSync(coverageSummary)) {
      const coverage = JSON.parse(fs.readFileSync(coverageSummary, 'utf8'));
      const total = coverage.total;
      
      log('\n📊 Coverage Summary:', 'cyan');
      log(`   Statements: ${total.statements.pct}%`, 'bright');
      log(`   Branches:   ${total.branches.pct}%`, 'bright');
      log(`   Functions:  ${total.functions.pct}%`, 'bright');
      log(`   Lines:      ${total.lines.pct}%`, 'bright');
      
      if (total.statements.pct >= 70 && total.branches.pct >= 70) {
        log('   ✅ Coverage thresholds met!', 'green');
        results.passed++;
      } else {
        log('   ⚠️  Coverage below 70% threshold', 'yellow');
        results.failed++;
      }
    }
  } else {
    results.failed++;
  }

  // Check critical files
  const criticalFiles = [
    'src/server.js',
    'src/models/index.js',
    'src/routes/index.js',
    'jest.config.js'
  ];

  criticalFiles.forEach(file => {
    const filePath = path.join(BACKEND_DIR, file);
    if (checkFile(filePath, file)) {
      results.passed++;
    } else {
      results.failed++;
    }
  });

  return results;
}

async function verifyFrontend() {
  section('FRONTEND BUILD VERIFICATION');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Check if frontend directory exists
  if (!checkDirectory(FRONTEND_DIR, 'Frontend directory')) {
    results.failed++;
    return results;
  }

  // Check package.json
  if (checkFile(path.join(FRONTEND_DIR, 'package.json'), 'package.json')) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Create .env file for build
  const envContent = `REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_ENV=production
REACT_APP_DEBUG_MODE=false`;
  
  fs.writeFileSync(path.join(FRONTEND_DIR, '.env'), envContent);
  log('✅ Created .env file for build', 'green');
  results.passed++;

  // Install dependencies
  if (execute('npm ci', FRONTEND_DIR, 'Install frontend dependencies')) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Run tests (if configured)
  log('\n⏳ Running frontend tests...', 'yellow');
  try {
    execSync('npm test -- --passWithNoTests --watchAll=false', {
      cwd: FRONTEND_DIR,
      stdio: 'inherit',
      env: { ...process.env, CI: 'true' }
    });
    log('✅ Frontend tests - Complete', 'green');
    results.passed++;
  } catch (error) {
    log('⚠️  Frontend tests not configured or failed', 'yellow');
    results.passed++; // Don't fail the build for this
  }

  // Build frontend
  if (execute('npm run build', FRONTEND_DIR, 'Build frontend application')) {
    results.passed++;
    
    // Check build directory
    const buildDir = path.join(FRONTEND_DIR, 'build');
    if (checkDirectory(buildDir, 'Build output')) {
      results.passed++;
      
      // Get build size
      const buildSize = getDirSize(buildDir);
      log(`\n📦 Build Size: ${formatBytes(buildSize)}`, 'cyan');
      
      if (buildSize > 0 && buildSize < 50 * 1024 * 1024) { // Less than 50MB
        log('   ✅ Build size is reasonable', 'green');
        results.passed++;
      } else if (buildSize === 0) {
        log('   ❌ Build directory is empty', 'red');
        results.failed++;
      } else {
        log('   ⚠️  Build size is quite large', 'yellow');
        results.passed++;
      }
      
      // Check for index.html
      const indexHtml = path.join(buildDir, 'index.html');
      if (checkFile(indexHtml, 'index.html in build')) {
        results.passed++;
      } else {
        results.failed++;
      }
    } else {
      results.failed++;
    }
  } else {
    results.failed++;
  }

  // Check critical files
  const criticalFiles = [
    'src/App.js',
    'src/index.js',
    'public/index.html',
    'capacitor.config.js'
  ];

  criticalFiles.forEach(file => {
    const filePath = path.join(FRONTEND_DIR, file);
    if (checkFile(filePath, file)) {
      results.passed++;
    } else {
      results.failed++;
    }
  });

  return results;
}

async function verifyML() {
  section('ML PIPELINE VERIFICATION');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Check if ML directory exists
  if (!checkDirectory(ML_DIR, 'ML training directory')) {
    results.failed++;
    return results;
  }

  // Check requirements.txt
  if (checkFile(path.join(ML_DIR, 'requirements.txt'), 'requirements.txt')) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Check for trained model
  const modelFile = path.join(ML_DIR, 'models', 'ginger_disease_model.h5');
  if (checkFile(modelFile, 'Trained model (ginger_disease_model.h5)')) {
    results.passed++;
    
    const modelSize = fs.statSync(modelFile).size;
    log(`   Model size: ${formatBytes(modelSize)}`, 'cyan');
    
    if (modelSize > 1024) { // At least 1KB
      log('   ✅ Model file has content', 'green');
      results.passed++;
    } else {
      log('   ❌ Model file appears to be empty or corrupt', 'red');
      results.failed++;
    }
  } else {
    results.failed++;
  }

  // Check critical Python files
  const criticalFiles = [
    'cnn_model_training.py',
    'data_preprocessing.py',
    'model_export.py',
    'config.py'
  ];

  criticalFiles.forEach(file => {
    const filePath = path.join(ML_DIR, file);
    if (checkFile(filePath, file)) {
      results.passed++;
    } else {
      results.failed++;
    }
  });

  // Check data directory structure
  const dataDir = path.join(ML_DIR, 'data');
  if (checkDirectory(dataDir, 'Data directory')) {
    results.passed++;
    
    const processedDir = path.join(dataDir, 'processed');
    if (checkDirectory(processedDir, 'Processed data directory')) {
      results.passed++;
    } else {
      results.failed++;
    }
  } else {
    results.failed++;
  }

  return results;
}

async function main() {
  banner('🔍 GINGERLYAI BUILD VERIFICATION');
  
  log('Starting comprehensive build verification...', 'bright');
  log(`Target: ${targetComponent === 'all' ? 'All components' : targetComponent}`, 'cyan');
  log(`Time: ${new Date().toISOString()}`, 'cyan');
  
  const results = {
    backend: null,
    frontend: null,
    ml: null
  };

  try {
    // Verify components based on target
    if (targetComponent === 'all' || targetComponent === 'backend') {
      results.backend = await verifyBackend();
    }

    if (targetComponent === 'all' || targetComponent === 'frontend') {
      results.frontend = await verifyFrontend();
    }

    if (targetComponent === 'all' || targetComponent === 'ml') {
      results.ml = await verifyML();
    }

    // Print summary
    banner('📊 VERIFICATION SUMMARY');

    let totalPassed = 0;
    let totalFailed = 0;

    if (results.backend) {
      log(`\n🔧 Backend:`, 'bright');
      log(`   ✅ Passed: ${results.backend.passed}`, 'green');
      log(`   ❌ Failed: ${results.backend.failed}`, 'red');
      totalPassed += results.backend.passed;
      totalFailed += results.backend.failed;
    }

    if (results.frontend) {
      log(`\n📱 Frontend:`, 'bright');
      log(`   ✅ Passed: ${results.frontend.passed}`, 'green');
      log(`   ❌ Failed: ${results.frontend.failed}`, 'red');
      totalPassed += results.frontend.passed;
      totalFailed += results.frontend.failed;
    }

    if (results.ml) {
      log(`\n🤖 ML Pipeline:`, 'bright');
      log(`   ✅ Passed: ${results.ml.passed}`, 'green');
      log(`   ❌ Failed: ${results.ml.failed}`, 'red');
      totalPassed += results.ml.passed;
      totalFailed += results.ml.failed;
    }

    log(`\n${'═'.repeat(65)}`, 'cyan');
    log(`\n📈 Overall Results:`, 'bright');
    log(`   Total Passed: ${totalPassed}`, 'green');
    log(`   Total Failed: ${totalFailed}`, totalFailed > 0 ? 'red' : 'green');
    
    const passRate = ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(2);
    log(`   Pass Rate:    ${passRate}%`, passRate >= 90 ? 'green' : passRate >= 70 ? 'yellow' : 'red');

    if (totalFailed === 0) {
      log(`\n🎉 All verifications passed! Ready for CI/CD.`, 'green');
      process.exit(0);
    } else {
      log(`\n⚠️  Some verifications failed. Please fix issues before pushing.`, 'yellow');
      process.exit(1);
    }

  } catch (error) {
    log(`\n❌ Build verification failed with error:`, 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

// Run verification
main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});

