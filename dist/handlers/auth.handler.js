"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const security_config_1 = require("../config/security.config");
const server_1 = require("../server");
//-- LOGIN --//
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        const client = await server_1.dbPool.connect();
        try {
            // Get user with provided email
            const result = await client.query('SELECT id, first_name, last_name, password_digest FROM users WHERE email = $1', [email]);
            if (result.rows.length === 0) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }
            const user = result.rows[0];
            // Check password
            const pepper = security_config_1.SecurityConfig.password.pepper;
            const validPassword = await bcrypt_1.default.compare(password + pepper, user.password_digest);
            if (!validPassword) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
            }, 
            //-- ASSERTION
            security_config_1.SecurityConfig.jwt.secret, { expiresIn: security_config_1.SecurityConfig.jwt.expiresIn });
            // Return user and token
            res.json({
                user: {
                    id: user.id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                },
                token,
            });
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.login = login;
//-- SIGNUP --//
const signup = async (req, res) => {
    const { first_name, last_name, email, password } = req.body;
    // Validate inputs
    if (!first_name || !last_name || !email || !password) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400).json({ error: 'Invalid email format' });
        return;
    }
    // Validate password strength
    if (password.length < security_config_1.SecurityConfig.password.minLength) {
        res.status(400).json({
            error: `Password must be at least ${security_config_1.SecurityConfig.password.minLength} characters long`,
        });
        return;
    }
    // Password Hashing
    const pepper = security_config_1.SecurityConfig.password.pepper;
    const saltRounds = security_config_1.SecurityConfig.password.saltRounds;
    const hashedPassword = await bcrypt_1.default.hash(password + pepper, saltRounds);
    const client = await server_1.dbPool.connect();
    try {
        // Check if email already exists
        const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            res.status(400).json({ error: 'Email already registered' });
            return;
        }
        // Create user
        const result = await client.query('INSERT INTO users (first_name, last_name, email, password_digest) VALUES ($1, $2, $3, $4) RETURNING id, first_name, last_name', [first_name, last_name, email, hashedPassword]);
        const user = result.rows[0];
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
        }, security_config_1.SecurityConfig.jwt.secret, {
            expiresIn: security_config_1.SecurityConfig.jwt.expiresIn,
        });
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
        console.error('Error during signup:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    finally {
        client.release();
    }
};
exports.signup = signup;
//# sourceMappingURL=auth.handler.js.map