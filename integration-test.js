#!/usr/bin/env node

/**
 * Integration Test Script for GingerlyAI Backend-Mobile Communication
 * Tests all major API endpoints and ensures mobile app can connect
 */

const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000/api';

class IntegrationTester {
  constructor() {
    this.testResults = [];
    this.accessToken = null;
    this.refreshToken = null;
  }

  async runTest(testName, testFunction) {
    console.log(`\n🧪 Testing: ${testName}`);
    try {
      await testFunction();
      console.log(`✅ PASS: ${testName}`);
      this.testResults.push({ test: testName, status: 'PASS' });
    } catch (error) {
      console.log(`❌ FAIL: ${testName} - ${error.message}`);
      this.testResults.push({ test: testName, status: 'FAIL', error: error.message });
    }
  }

  async testHealthEndpoint() {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    if (data.status !== 'OK') {
      throw new Error(`Expected status 'OK', got '${data.status}'`);
    }
    
    console.log(`   📊 Backend version: ${data.version}`);
    console.log(`   ⏰ Timestamp: ${data.timestamp}`);
  }

  async testUserRegistration() {
    const testUser = {
      name: 'Test Farmer',
      email: `test_${Date.now()}@example.com`,
      password: 'TestPassword123!',
      role: 'user',
      location: 'Test Farm, Test State'
    };

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    const data = await response.json();

    if (response.status !== 201) {
      throw new Error(`Registration failed: ${data.message || response.statusText}`);
    }

    if (!data.tokens || !data.user) {
      throw new Error('Registration response missing tokens or user data');
    }

    this.accessToken = data.tokens.accessToken;
    this.refreshToken = data.tokens.refreshToken;
    this.testUser = data.user;

    console.log(`   👤 Registered user: ${data.user.name} (${data.user.email})`);
  }

  async testUserLogin() {
    if (!this.testUser) {
      throw new Error('No test user available for login test');
    }

    const loginData = {
      email: this.testUser.email,
      password: 'TestPassword123!'
    };

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });

    const data = await response.json();

    if (response.status !== 200) {
      throw new Error(`Login failed: ${data.message || response.statusText}`);
    }

    console.log(`   🔐 Login successful for: ${data.user.name}`);
  }

  async testProfileEndpoint() {
    if (!this.accessToken) {
      throw new Error('No access token available for profile test');
    }

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${this.accessToken}` }
    });

    const data = await response.json();

    if (response.status !== 200) {
      throw new Error(`Profile fetch failed: ${data.message || response.statusText}`);
    }

    console.log(`   👤 Profile loaded: ${data.user.name}`);
  }

  async testRemediesEndpoint() {
    if (!this.accessToken) {
      throw new Error('No access token available for remedies test');
    }

    const response = await fetch(`${API_BASE_URL}/remedies`, {
      headers: { 'Authorization': `Bearer ${this.accessToken}` }
    });

    const data = await response.json();

    if (response.status !== 200) {
      throw new Error(`Remedies fetch failed: ${data.message || response.statusText}`);
    }

    console.log(`   🌿 Remedies endpoint working (${data.count || 0} remedies)`);
  }

  async testModelEndpoints() {
    // Test active model endpoint (should work without auth)
    const response = await fetch(`${API_BASE_URL}/models/active`);
    
    if (response.status === 404) {
      console.log(`   📱 No active model found (this is normal for new setup)`);
      return;
    }
    
    if (response.status !== 200) {
      const data = await response.json();
      throw new Error(`Active model fetch failed: ${data.message || response.statusText}`);
    }

    const data = await response.json();
    console.log(`   🤖 Active model endpoint working`);
  }

  async testPredictionsEndpoint() {
    if (!this.accessToken) {
      throw new Error('No access token available for predictions test');
    }

    const response = await fetch(`${API_BASE_URL}/predictions`, {
      headers: { 'Authorization': `Bearer ${this.accessToken}` }
    });

    const data = await response.json();

    if (response.status !== 200) {
      throw new Error(`Predictions fetch failed: ${data.message || response.statusText}`);
    }

    console.log(`   📊 Predictions endpoint working (${data.count || 0} predictions)`);
  }

  async testTokenRefresh() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available for refresh test');
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken })
    });

    const data = await response.json();

    if (response.status !== 200) {
      throw new Error(`Token refresh failed: ${data.message || response.statusText}`);
    }

    console.log(`   🔄 Token refresh working`);
  }

  async runAllTests() {
    console.log('🚀 Starting GingerlyAI Backend-Mobile Integration Tests\n');
    console.log('Testing backend API endpoints that mobile app will use...\n');

    await this.runTest('Health Check', () => this.testHealthEndpoint());
    await this.runTest('User Registration', () => this.testUserRegistration());
    await this.runTest('User Login', () => this.testUserLogin());
    await this.runTest('Profile Access', () => this.testProfileEndpoint());
    await this.runTest('Remedies API', () => this.testRemediesEndpoint());
    await this.runTest('Models API', () => this.testModelEndpoints());
    await this.runTest('Predictions API', () => this.testPredictionsEndpoint());
    await this.runTest('Token Refresh', () => this.testTokenRefresh());

    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 INTEGRATION TEST SUMMARY');
    console.log('='.repeat(60));

    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;

    console.log(`✅ Tests Passed: ${passed}`);
    console.log(`❌ Tests Failed: ${failed}`);
    console.log(`📊 Total Tests: ${this.testResults.length}`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.filter(r => r.status === 'FAIL').forEach(test => {
        console.log(`   • ${test.test}: ${test.error}`);
      });
    }

    if (failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Backend-Mobile integration is working correctly.');
      console.log('\n✨ Next Steps:');
      console.log('1. Mobile app should be able to connect to backend at http://localhost:3000/api');
      console.log('2. Users can register, login, and access all features');
      console.log('3. Ready for development and testing!');
    } else {
      console.log('\n🔧 Some tests failed. Check the backend configuration and ensure:');
      console.log('1. Backend server is running on port 3000');
      console.log('2. Database is properly configured');
      console.log('3. Environment variables are set correctly');
    }

    console.log('\n' + '='.repeat(60));
  }
}

// Run tests if script is called directly
if (require.main === module) {
  const tester = new IntegrationTester();
  
  // Add delay to ensure backend has started
  setTimeout(() => {
    tester.runAllTests().catch(error => {
      console.error('\n💥 Integration test suite failed:', error.message);
      process.exit(1);
    });
  }, 2000);
}

module.exports = IntegrationTester;

