"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment specific configuration
const envPath = process.env.NODE_ENV === 'test'
    ? path_1.default.join(__dirname, '../../.env.test')
    : path_1.default.join(__dirname, '../../.env');
dotenv_1.default.config({ path: envPath });
const getDBConfig = () => {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || '',
        user: process.env.DB_USER || '',
        password: process.env.DB_PASSWORD || '',
    };
    // Validate required fields
    const requiredFields = ['host', 'database', 'user'];
    for (const field of requiredFields) {
        if (!config[field]) {
            throw new Error(`Missing required database configuration: ${field}`);
        }
    }
    return config;
};
exports.default = getDBConfig;
//# sourceMappingURL=db.config.js.map