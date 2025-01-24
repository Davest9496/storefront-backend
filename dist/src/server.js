"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbPool = void 0;
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_config_1 = require("./config/db.config");
const router_1 = __importDefault(require("./routes/router"));
const security_config_1 = require("./config/security.config");
// Load environment variables
dotenv_1.default.config();
// Verify security configuration before starting the server
if (!(0, security_config_1.verifySecurityConfig)()) {
    console.error('Failed to verify security configuration. Please check your environment variables.');
    process.exit(1);
}
// Create and export the database pool
exports.dbPool = (0, db_config_1.createPool)();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware setup
app.use(body_parser_1.default.json());
app.use(express_1.default.json());
// Health check endpoint to verify database connectivity
app.get('/health', async (_req, res) => {
    try {
        await (0, db_config_1.testConnection)(exports.dbPool);
        res.json({
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString(),
        });
    }
    catch {
        res.status(500).json({
            status: 'unhealthy',
            database: 'disconnected',
            timestamp: new Date().toISOString(),
        });
    }
});
// API routes
app.use('/api', router_1.default);
// Error handling middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res, next) => {
    console.error('Error:', err);
    const errorResponse = {
        error: 'Internal Server Error',
        status: 500,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
        timestamp: new Date().toISOString(),
    };
    res.status(500).json(errorResponse);
});
// // Start server function with database connection check
// const startServer = async () => {
//   try {
//     // Verify database connection before starting server
//     await testConnection(dbPool);
//     console.log('Database connection verified');
//     app.listen(port, () => {
//       console.log(`Server started successfully on port: ${port}`);
//       console.log(`Health check available at: http://localhost:${port}/health`);
//     });
//   } catch (error) {
//     console.error('Failed to start server:', error);
//     process.exit(1); // Exit if we can't connect to the database
//   }
// };
// // Start the server
// startServer();
exports.default = app;
//# sourceMappingURL=server.js.map