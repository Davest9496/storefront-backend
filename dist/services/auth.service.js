"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const security_config_1 = require("../config/security.config");
class AuthService {
    static async hashPassword(password) {
        return bcrypt_1.default.hash(password + security_config_1.SecurityConfig.password.pepper, security_config_1.SecurityConfig.password.saltRounds);
    }
    static async verifyPassword(password, hashedPassword) {
        return bcrypt_1.default.compare(password + security_config_1.SecurityConfig.password.pepper, hashedPassword);
    }
    static generateToken(user) {
        return jsonwebtoken_1.default.sign({
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
            const decoded = jsonwebtoken_1.default.verify(token, security_config_1.SecurityConfig.jwt.secret, {
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