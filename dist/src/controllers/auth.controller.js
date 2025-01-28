"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const server_1 = require("../server");
const user_model_1 = require("../models/user.model");
const auth_service_1 = require("../services/auth.service");
class AuthController {
    static async signup(req, res) {
        const { first_name, last_name, email, password } = req.body;
        if (!first_name?.trim() ||
            !last_name?.trim() ||
            !email?.trim() ||
            !password) {
            res.status(400).json({
                error: 'All fields are required: first_name, last_name, email, password',
            });
            return;
        }
        if (!auth_service_1.AuthService.validateEmail(email)) {
            res.status(400).json({ error: 'Invalid email format' });
            return;
        }
        const passwordValidation = auth_service_1.AuthService.validatePassword(password);
        if (!passwordValidation.isValid) {
            res.status(400).json({ error: passwordValidation.error });
            return;
        }
        const client = await server_1.dbPool.connect();
        try {
            await client.query('BEGIN');
            const userModel = new user_model_1.UserModel(client);
            if (await userModel.checkEmailExists(email)) {
                res.status(400).json({ error: 'Email already registered' });
                return;
            }
            const hashedPassword = await auth_service_1.AuthService.hashPassword(password);
            const user = await userModel.create({ first_name, last_name, email }, hashedPassword);
            await client.query('COMMIT');
            const token = auth_service_1.AuthService.generateToken(user);
            res.status(201).json({
                user: {
                    id: user.id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                },
                token,
            });
        }
        catch (error) {
            await client.query('ROLLBACK');
            console.error('Signup error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
        finally {
            client.release();
        }
    }
    static async login(req, res) {
        const { email, password } = req.body;
        if (!email?.trim() || !password) {
            res.status(400).json({
                error: 'Email and password are required',
                details: !email?.trim() ? 'Email is missing' : 'Password is missing',
            });
            return;
        }
        if (!auth_service_1.AuthService.validateEmail(email)) {
            res.status(400).json({ error: 'Invalid email format' });
            return;
        }
        const client = await server_1.dbPool.connect();
        try {
            const userModel = new user_model_1.UserModel(client);
            const user = await userModel.findByEmail(email);
            if (!user ||
                !(await auth_service_1.AuthService.verifyPassword(password, user.password_digest))) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }
            const token = auth_service_1.AuthService.generateToken(user);
            res.json({
                user: {
                    id: user.id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                },
                token,
            });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
        finally {
            client.release();
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map