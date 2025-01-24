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
exports.AuthService = void 0;
const bcrypt = __importStar(require("bcrypt"));
const jwt = __importStar(require("jsonwebtoken"));
const security_config_1 = require("../config/security.config");
class AuthService {
    static async hashPassword(password) {
        return bcrypt.hash(password + security_config_1.SecurityConfig.password.pepper, security_config_1.SecurityConfig.password.saltRounds);
    }
    static async verifyPassword(password, hashedPassword) {
        return bcrypt.compare(password + security_config_1.SecurityConfig.password.pepper, hashedPassword);
    }
    static generateToken(user) {
        return jwt.sign({
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            iat: Math.floor(Date.now() / 1000),
        }, security_config_1.SecurityConfig.jwt.secret, {
            expiresIn: security_config_1.SecurityConfig.jwt.expiresIn,
            algorithm: security_config_1.SecurityConfig.jwt.algorithm,
        });
    }
    static validateToken(token) {
        try {
            const decoded = jwt.verify(token, security_config_1.SecurityConfig.jwt.secret, {
                algorithms: [security_config_1.SecurityConfig.jwt.algorithm],
            });
            const now = Math.floor(Date.now() / 1000);
            if (decoded.exp < now) {
                return null;
            }
            return {
                id: decoded.id,
                firstName: decoded.firstName,
                lastName: decoded.lastName,
            };
        }
        catch (error) {
            console.error('Token validation error:', error);
            return null;
        }
    }
    static validatePassword(password) {
        if (password.length < security_config_1.SecurityConfig.password.minLength) {
            return {
                isValid: false,
                error: `Password must be at least ${security_config_1.SecurityConfig.password.minLength} characters long`,
            };
        }
        if (security_config_1.SecurityConfig.password.requireSpecialChar &&
            !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return {
                isValid: false,
                error: 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)',
            };
        }
        if (security_config_1.SecurityConfig.password.requireNumber && !/\d/.test(password)) {
            return {
                isValid: false,
                error: 'Password must contain at least one number',
            };
        }
        return { isValid: true };
    }
    static validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map