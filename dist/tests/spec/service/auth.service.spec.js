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
const auth_service_1 = require("../../../src/services/auth.service");
const jwt = __importStar(require("jsonwebtoken"));
const security_config_1 = require("../../../src/config/security.config");
describe('AuthService', () => {
    const validPassword = 'ValidPass123!';
    const invalidPassword = 'weak';
    const user = { id: 1, first_name: 'John', last_name: 'Doe' };
    const email = 'test@example.com';
    const invalidEmail = 'test@.com';
    it('should validate correct password format', () => {
        const result = auth_service_1.AuthService.validatePassword(validPassword);
        expect(result.isValid).toBe(true);
    });
    it('should reject invalid password format', () => {
        const result = auth_service_1.AuthService.validatePassword(invalidPassword);
        expect(result.isValid).toBe(false);
    });
    it('should hash password correctly', async () => {
        const hashedPassword = await auth_service_1.AuthService.hashPassword(validPassword);
        expect(hashedPassword).toBeDefined();
        expect(hashedPassword).not.toBe(validPassword);
    });
    it('should verify password correctly', async () => {
        const hashedPassword = await auth_service_1.AuthService.hashPassword(validPassword);
        const isMatch = await auth_service_1.AuthService.verifyPassword(validPassword, hashedPassword);
        expect(isMatch).toBe(true);
    });
    it('should generate a valid token', () => {
        const token = auth_service_1.AuthService.generateToken(user);
        const decoded = jwt.verify(token, security_config_1.SecurityConfig.jwt.secret);
        expect(decoded).toBeDefined();
        expect(decoded.id).toBe(user.id);
    });
    it('should validate a valid token', () => {
        const token = auth_service_1.AuthService.generateToken(user);
        const validatedUser = auth_service_1.AuthService.validateToken(token);
        expect(validatedUser).toBeDefined();
        expect(validatedUser?.id).toBe(user.id);
    });
    it('should invalidate an expired token', () => {
        const token = jwt.sign({
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            iat: Math.floor(Date.now() / 1000) - 3600,
        }, security_config_1.SecurityConfig.jwt.secret, { expiresIn: '1h', algorithm: security_config_1.SecurityConfig.jwt.algorithm });
        const validatedUser = auth_service_1.AuthService.validateToken(token);
        expect(validatedUser).toBeNull();
    });
    it('should validate correct email format', () => {
        const result = auth_service_1.AuthService.validateEmail(email);
        expect(result).toBe(true);
    });
    it('should reject invalid email format', () => {
        const result = auth_service_1.AuthService.validateEmail(invalidEmail);
        expect(result).toBe(false);
    });
});
//# sourceMappingURL=auth.service.spec.js.map