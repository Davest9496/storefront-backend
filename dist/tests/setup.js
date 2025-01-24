"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jasmine_1 = __importDefault(require("jasmine"));
const jasmine_spec_reporter_1 = require("jasmine-spec-reporter");
const database_1 = require("./helpers/database");
const jasmineInstance = new jasmine_1.default();
jasmineInstance.loadConfigFile('tests/jasmine.json');
jasmineInstance.clearReporters();
jasmineInstance.addReporter(new jasmine_spec_reporter_1.SpecReporter());
beforeAll(async () => {
    try {
        await (0, database_1.testConnection)();
        await (0, database_1.truncateTables)();
    }
    catch (error) {
        console.error('Database setup failed:', error);
        process.exit(1);
    }
});
afterAll(async () => {
    await (0, database_1.closePool)();
});
jasmineInstance.execute();
//# sourceMappingURL=setup.js.map