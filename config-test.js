#!/usr/bin/env node

/**
 * Comprehensive Configuration Test for GingerlyAI
 * Tests all configurations and dependencies
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 GingerlyAI Configuration Test\n');

// Test 1: Check .env files exist
console.log('📁 Testing Environment Files...');
const backendEnvPath = './backend/.env';
const mobileEnvPath = './mobile/.env';

if (fs.existsSync(backendEnvPath)) {
  console.log('✅ Backend .env exists');
} else {
  console.log('❌ Backend .env missing');
}

if (fs.existsSync(mobileEnvPath)) {
  console.log('✅ Mobile .env exists');
} else {
  console.log('❌ Mobile .env missing');
}

// Test 2: Check package.json files
console.log('\n📦 Testing Package Files...');
const backendPackagePath = './backend/package.json';
const mobilePackagePath = './mobile/package.json';

if (fs.existsSync(backendPackagePath)) {
  const backendPkg = JSON.parse(fs.readFileSync(backendPackagePath, 'utf8'));
  console.log(`✅ Backend package.json exists (${backendPkg.name} v${backendPkg.version})`);
} else {
  console.log('❌ Backend package.json missing');
}

if (fs.existsSync(mobilePackagePath)) {
  const mobilePkg = JSON.parse(fs.readFileSync(mobilePackagePath, 'utf8'));
  console.log(`✅ Mobile package.json exists (${mobilePkg.name} v${mobilePkg.version})`);
} else {
  console.log('❌ Mobile package.json missing');
}

// Test 3: Check node_modules
console.log('\n📚 Testing Dependencies...');
const backendNodeModules = './backend/node_modules';
const mobileNodeModules = './mobile/node_modules';

if (fs.existsSync(backendNodeModules)) {
  console.log('✅ Backend node_modules exists');
} else {
  console.log('❌ Backend node_modules missing - run: cd backend && npm install');
}

if (fs.existsSync(mobileNodeModules)) {
  console.log('✅ Mobile node_modules exists');
} else {
  console.log('❌ Mobile node_modules missing - run: cd mobile && npm install');
}

// Test 4: Check database file
console.log('\n💾 Testing Database...');
const dbPath = './backend/database.sqlite';
if (fs.existsSync(dbPath)) {
  console.log('✅ SQLite database exists');
} else {
  console.log('⚠️  SQLite database missing (will be created on first run)');
}

// Test 5: Check key directories
console.log('\n📂 Testing Directory Structure...');
const directories = [
  './backend/src',
  './backend/src/controllers',
  './backend/src/models',
  './backend/src/routes',
  './backend/src/middleware',
  './mobile/src',
  './mobile/src/pages',
  './mobile/src/services',
  './mobile/src/components',
  './ml-training'
];

directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir} exists`);
  } else {
    console.log(`❌ ${dir} missing`);
  }
});

// Test 6: Check Capacitor config
console.log('\n📱 Testing Mobile Configuration...');
const capacitorConfigPath = './mobile/capacitor.config.js';
if (fs.existsSync(capacitorConfigPath)) {
  console.log('✅ Capacitor config exists');
} else {
  console.log('❌ Capacitor config missing');
}

const manifestPath = './mobile/public/manifest.json';
if (fs.existsSync(manifestPath)) {
  console.log('✅ PWA manifest exists');
} else {
  console.log('❌ PWA manifest missing');
}

// Test 7: Check ML training files
console.log('\n🤖 Testing ML Configuration...');
const mlFiles = [
  './ml-training/config.py',
  './ml-training/model_training.py',
  './ml-training/requirements.txt'
];

mlFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

console.log('\n🎯 Configuration Test Complete!');
console.log('\n📋 Next Steps:');
console.log('1. Provide your .env file contents for detailed analysis');
console.log('2. Run: cd backend && npm run dev');
console.log('3. Run: cd mobile && npm start');
console.log('4. Test the integration with: node integration-test.js');
