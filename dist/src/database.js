"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const db_config_1 = __importDefault(require("./config/db.config"));
const pool = new pg_1.Pool((0, db_config_1.default)());
exports.default = pool;
//# sourceMappingURL=database.js.map