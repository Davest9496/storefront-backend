"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jasmine_1 = __importDefault(require("jasmine"));
const jasmine_spec_reporter_1 = require("jasmine-spec-reporter");
const jasmine = new jasmine_1.default();
jasmine.loadConfigFile('spec/support/jasmine.json');
jasmine.clearReporters();
jasmine.addReporter(new jasmine_spec_reporter_1.SpecReporter({
    spec: {
        displayPending: true,
        displayStacktrace: 'pretty',
    },
}));
jasmine.execute();
//# sourceMappingURL=jasmine.js.map