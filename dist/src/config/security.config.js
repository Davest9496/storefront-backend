"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySecurityConfig = exports.SecurityConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables at startup
dotenv_1.default.config();
// Function to ensure all required security settings are present
const validateSecurityConfig = () => {
    const requiredEnvVars = ['JWT_SECRET', 'PASSWORD_PEPPER', 'SALT_ROUNDS'];
    const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
};
// Run validation immediately
validateSecurityConfig();
// Export our security configuration
exports.SecurityConfig = {
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: '24h',
        algorithm: 'HS256',
    },
    password: {
        // The pepper adds an additional layer of security beyond the salt
        pepper: process.env.PASSWORD_PEPPER,
        // Salt rounds determine how computationally intensive the hashing will be
        saltRounds: parseInt(process.env.SALT_ROUNDS || '10', 10),
        minLength: 8,
        requireSpecialChar: true,
        requireNumber: true,
        requireUpperCase: true,
    },
};
// Helper function to verify security configuration
const verifySecurityConfig = () => {
    try {
        validateSecurityConfig();
        return true;
    }
    catch (error) {
        console.error('Security configuration error:', error);
        return false;
    }
};
exports.verifySecurityConfig = verifySecurityConfig;
//# sourceMappingURL=security.config.js.map