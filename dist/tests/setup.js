"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jasmine_1 = __importDefault(require("jasmine"));
const jasmine_spec_reporter_1 = require("jasmine-spec-reporter");
const server_1 = __importDefault(require("../src/server")); // Add this import
const jasmineInstance = new jasmine_1.default();
// Configure Jasmine
jasmineInstance.loadConfigFile('tests/jasmine.json');
jasmineInstance.clearReporters();
jasmineInstance.addReporter(new jasmine_spec_reporter_1.SpecReporter());
// Makes app available to tests
global.app = server_1.default;
jasmineInstance.execute();
//# sourceMappingURL=setup.js.map