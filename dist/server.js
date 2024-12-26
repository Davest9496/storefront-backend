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
const router_1 = require("./routes/router");
dotenv_1.default.config();
// Database Connection
exports.dbPool = (0, db_config_1.createPool)();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(body_parser_1.default.json());
app.use(express_1.default.json());
app.use('/api', router_1.router);
// Basic error handling middleware
// app.use((err: Error, req: Request, res: Response, next: Function) => {
//   console.error(err.stack);
//   res.status(500).json({
//     error: 'Internal Server Error',
//     status: 500,
//     details: process.env.NODE_ENV === 'dev' ? err.message : undefined
//   });
// });
app.listen(port, function () {
    console.log(`starting app on: ${port}`);
});
exports.default = app;
//# sourceMappingURL=server.js.map