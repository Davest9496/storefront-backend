"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbPool = void 0;
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const pg_1 = require("pg");
const router_1 = __importDefault(require("./routes/router"));
dotenv_1.default.config();
// Database configuration
exports.dbPool = new pg_1.Pool({
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'storefront_dev',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware
app.use(body_parser_1.default.json());
app.use(express_1.default.json());
// Health check endpoint
app.get('/health', async (_req, res) => {
    try {
        const client = await exports.dbPool.connect();
        try {
            await client.query('SELECT NOW()');
            res.json({ status: 'healthy', database: 'connected' });
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        res.status(500).json({ status: 'unhealthy', database: 'disconnected' });
    }
});
// API routes
app.use('/api', router_1.default);
// Error handling middleware
app.use((err, _req, res, _next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server started on port ${port}`);
    });
}
exports.default = app;
//# sourceMappingURL=server.js.map