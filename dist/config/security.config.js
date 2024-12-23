"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityConfig = void 0;
//-- Centraliszed Config object for security-related constants
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.SecurityConfig = {
    // JWT configuaration
    jwt: {
        secret: process.env.TOKEN_SECRET,
        expiresIn: '1h',
        algorithm: 'HS256',
    },
    // Password hasshing config
    password: {
        pepper: process.env.PEPPER,
        saltRounds: parseInt(process.env.SALT_ROUNDS || '10'),
        //-- For stronger password enforcement --//
        // minLength: 8,
        // requireSpecialChar: true,
        // requireNumber: true,
        // requireUpperCase: true
    },
};
//# sourceMappingURL=security.config.js.map