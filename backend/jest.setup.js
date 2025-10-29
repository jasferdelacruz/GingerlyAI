// Jest setup file - runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing-only';
process.env.DATABASE_URL = ':memory:'; // Use in-memory SQLite for tests

// Extend Jest matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },

  toHaveStatus(response, expectedStatus) {
    const pass = response.status === expectedStatus;
    if (pass) {
      return {
        message: () => `expected response not to have status ${expectedStatus}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected response to have status ${expectedStatus}, but got ${response.status}`,
        pass: false,
      };
    }
  }
});

// Global test setup
beforeAll(() => {
  console.log('🧪 Running GingerlyAI Backend Tests\n');
});

// Global test teardown
afterAll(() => {
  console.log('\n✅ Tests complete!');
});

// Suppress specific console warnings during tests
const originalWarn = console.warn;
console.warn = (...args) => {
  const warningMessage = args[0];
  
  // Suppress specific warnings
  const suppressWarnings = [
    'Setting a timer for a long period of time',
    'punycode'
  ];

  if (suppressWarnings.some(msg => warningMessage?.includes?.(msg))) {
    return;
  }

  originalWarn(...args);
};

