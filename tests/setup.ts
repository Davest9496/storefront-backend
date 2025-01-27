import dotenv from 'dotenv';
import path from 'path';
import Jasmine from 'jasmine';
import { SpecReporter, StacktraceOption } from 'jasmine-spec-reporter';
import TestDb from './helpers/testDb';

// Load test environment variables
const envPath =
  process.env.NODE_ENV === 'test'
    ? path.join(__dirname, '..', '.env.test')
    : path.join(__dirname, '..', '.env');

// Verify test database
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
};

console.log('Test Database Configuration:', dbConfig);

if (dbConfig.database !== 'storefront_test') {
  console.error('ERROR: Tests must run on storefront_test database');
  process.exit(1);
}

// Initialize Jasmine
const jasmine = new Jasmine();
jasmine.loadConfigFile('tests/support/jasmine.json');

// Remove default reporter logs
jasmine.clearReporters();

// Add better reporter with database info
jasmine.addReporter(
  new SpecReporter({
    spec: {
      displayPending: true,
      displayStacktrace: StacktraceOption.PRETTY,
    },
    summary: {
      displayDuration: true,
      displaySuccessful: true,
      displayFailed: true,
      displayPending: true,
    },
    prefixes: {
      successful: `✓ [DB: ${dbConfig.database}] `,
      failed: `✗ [DB: ${dbConfig.database}] `,
      pending: `* [DB: ${dbConfig.database}] `,
    },
  })
);

// Global cleanup after all tests
jasmine.env.addReporter({
  jasmineDone: async () => {
    await TestDb.closeAll();
  },
});

// Start testing
jasmine.execute();
