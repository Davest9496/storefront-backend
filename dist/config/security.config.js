"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySecurityConfig = exports.SecurityConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables at the start
dotenv_1.default.config();
// Function to validate required security configurations
const validateSecurityConfig = () => {
    // Check for required security environment variables
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable must be set');
    }
    if (!process.env.PASSWORD_PEPPER) {
        throw new Error('PASSWORD_PEPPER environment variable must be set');
    }
};
// Validate configuration when the file is loaded
validateSecurityConfig();
// Export the security configuration
exports.SecurityConfig = {
    jwt: {
        // Use environment variable with a development fallback (not recommended for production)
        secret: process.env.JWT_SECRET,
        expiresIn: '24h',
        algorithm: 'HS256',
    },
    password: {
        pepper: process.env.PASSWORD_PEPPER,
        saltRounds: parseInt(process.env.SALT_ROUNDS || '10'),
        minLength: 8,
        requireSpecialChar: true,
        requireNumber: true,
        requireUpperCase: true,
    },
};
// Add a helper function to verify the configuration is loaded
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