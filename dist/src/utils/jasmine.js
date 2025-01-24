"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("jasmine");
const db_test_utils_1 = __importDefault(require("./db-test.utils"));
beforeAll(async () => {
    await db_test_utils_1.default.init();
    await db_test_utils_1.default.setupTestDb();
});
afterAll(async () => {
    await db_test_utils_1.default.teardownTestDb();
    await db_test_utils_1.default.cleanup();
});
//# sourceMappingURL=jasmine.js.map