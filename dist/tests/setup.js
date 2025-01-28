"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const jasmine_1 = __importDefault(require("jasmine"));
const jasmine_spec_reporter_1 = require("jasmine-spec-reporter");
const testDb_1 = __importDefault(require("./helpers/testDb"));
// Load test environment variables
const envPath = process.env.NODE_ENV === 'test'
    ? path_1.default.join(__dirname, '..', '.env.test')
    : path_1.default.join(__dirname, '..', '.env');
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
const jasmine = new jasmine_1.default();
jasmine.loadConfigFile('tests/support/jasmine.json');
// Remove default reporter logs
jasmine.clearReporters();
// Add better reporter with database info
jasmine.addReporter(new jasmine_spec_reporter_1.SpecReporter({
    spec: {
        displayPending: true,
        displayStacktrace: jasmine_spec_reporter_1.StacktraceOption.PRETTY,
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
}));
// Global cleanup after all tests
jasmine.env.addReporter({
    jasmineDone: async () => {
        await testDb_1.default.closeAll();
    },
});
// Start testing
jasmine.execute();
//# sourceMappingURL=setup.js.map