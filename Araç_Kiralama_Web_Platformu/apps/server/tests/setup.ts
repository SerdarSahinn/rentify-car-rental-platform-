// Test setup - minimal version
// Bu dosya her test dosyasından önce çalışır

// Environment variables for tests
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./test.db';

// Konsol loglarını test sırasında gizle
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

export {};