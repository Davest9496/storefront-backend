"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateToken = exports.login = exports.signup = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const server_1 = require("../server");
const security_config_1 = require("../config/security.config");
// Signup endpoint handler
const signup = async (req, res) => {
    const { first_name, last_name, email, password } = req.body;
    // Input validation
    if (!first_name || !last_name || !email || !password) {
        res
            .status(400)
            .json({
            error: 'All fields are required: first_name, last_name, email, password',
        });
        return;
    }
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400).json({ error: 'Invalid email format' });
        return;
    }
    // Password strength validation
    if (password.length < security_config_1.SecurityConfig.password.minLength) {
        res.status(400).json({
            error: `Password must be at least ${security_config_1.SecurityConfig.password.minLength} characters long`,
        });
        return;
    }
    if (security_config_1.SecurityConfig.password.requireSpecialChar &&
        !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        res
            .status(400)
            .json({ error: 'Password must contain at least one special character' });
        return;
    }
    if (security_config_1.SecurityConfig.password.requireNumber && !/\d/.test(password)) {
        res
            .status(400)
            .json({ error: 'Password must contain at least one number' });
        return;
    }
    const client = await server_1.dbPool.connect();
    try {
        await client.query('BEGIN');
        // Check for existing user
        const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            res.status(400).json({ error: 'Email already registered' });
            return;
        }
        // Hash password with pepper
        const pepper = security_config_1.SecurityConfig.password.pepper;
        const saltRounds = security_config_1.SecurityConfig.password.saltRounds;
        const hashedPassword = await bcrypt_1.default.hash(password + pepper, saltRounds);
        // Insert new user
        const result = await client.query(`INSERT INTO users (first_name, last_name, email, password_digest) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, first_name, last_name`, [first_name, last_name, email, hashedPassword]);
        await client.query('COMMIT');
        const user = result.rows[0];
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
        }, security_config_1.SecurityConfig.jwt.secret, { expiresIn: security_config_1.SecurityConfig.jwt.expiresIn });
        const response = {
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
            },
            token,
        };
        res.status(201).json(response);
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('Signup error:', error);
        if (error.code === '23505') {
            // Unique violation
            res.status(400).json({ error: 'Email already registered' });
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    finally {
        client.release();
    }
};
exports.signup = signup;
// Login endpoint handler
const login = async (req, res) => {
    const { email, password } = req.body;
    // Input validation
    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400).json({ error: 'Invalid email format' });
        return;
    }
    const client = await server_1.dbPool.connect();
    try {
        console.log('Login attempt for email:', email);
        // Find user by email
        const result = await client.query('SELECT id, first_name, last_name, password_digest FROM users WHERE email = $1', [email]);
        console.log('User found:', result.rows.length > 0);
        if (result.rows.length === 0) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const user = result.rows[0];
        // Compare passwords with pepper
        const pepper = security_config_1.SecurityConfig.password.pepper;
        const isValid = await bcrypt_1.default.compare(password + pepper, user.password_digest);
        console.log('Password verification result:', isValid);
        if (!isValid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
        }, security_config_1.SecurityConfig.jwt.secret, { expiresIn: security_config_1.SecurityConfig.jwt.expiresIn });
        const response = {
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
            },
            token,
        };
        res.json(response);
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    finally {
        client.release();
    }
};
exports.login = login;
// Helper function to validate tokens
const validateToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, security_config_1.SecurityConfig.jwt.secret);
        return {
            id: decoded.id,
            firstName: decoded.firstName,
            lastName: decoded.lastName,
        };
    }
    catch (error) {
        console.log('error:', error);
        return null;
    }
};
exports.validateToken = validateToken;
//# sourceMappingURL=auth.handler.js.map