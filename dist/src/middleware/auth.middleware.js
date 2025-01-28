"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const auth_service_1 = require("../services/auth.service");
const security_config_1 = require("../config/security.config");
class AuthMiddleware {
    static verifyAuthToken(req, res, next) {
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
            const user = auth_service_1.AuthService.validateToken(token);
            if (!user) {
                res.status(401).json({ error: 'Invalid or expired token' });
                return;
            }
            // Add validated user to request object
            req.user = user;
            next();
        }
        catch (error) {
            console.error('Auth middleware error:', error);
            res.status(401).json({ error: 'Invalid or expired token' });
        }
    }
}
exports.AuthMiddleware = AuthMiddleware;
//# sourceMappingURL=auth.middleware.js.map