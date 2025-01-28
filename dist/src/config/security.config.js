"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySecurityConfig = exports.SecurityConfig = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
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