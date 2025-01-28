"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const db_config_1 = __importDefault(require("../../src/config/db.config"));
class TestDb {
    static getPool() {
        if (!this.pool) {
            this.pool = new pg_1.Pool((0, db_config_1.default)());
        }
        return this.pool;
    }
    static async getClient() {
        const client = await this.getPool().connect();
        this.clients.push(client);
        return client;
    }
    static async closeAll() {
        // Release all clients
        for (const client of this.clients) {
            if (client) {
                try {
                    client.release();
                }
                catch (error) {
                    console.error('Error releasing client:', error);
                }
            }
        }
        this.clients = [];
        // End pool if it exists
        if (this.pool) {
            try {
                await this.pool.end();
            }
            catch (error) {
                console.error('Error ending pool:', error);
            }
            this.pool = null;
        }
    }
}
TestDb.pool = null;
TestDb.clients = [];
exports.default = TestDb;
//# sourceMappingURL=testDb.js.map