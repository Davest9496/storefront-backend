"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAuthToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const security_config_1 = require("../config/security.config");
const verifyAuthToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ error: 'Authorization header missing' });
            return;
        }
        const token = authHeader.split(' ')[1];
        if (!security_config_1.SecurityConfig.jwt.secret) {
            throw new Error('JWT secret is not defined');
        }
        const decoded = jsonwebtoken_1.default.verify(token, security_config_1.SecurityConfig.jwt.secret);
        // Add decoded user to request object
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error(error);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};
exports.verifyAuthToken = verifyAuthToken;
//# sourceMappingURL=auth.middleware.js.map