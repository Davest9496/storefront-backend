'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.dbPool = void 0;
const express_1 = __importDefault(require('express'));
const body_parser_1 = __importDefault(require('body-parser'));
const dotenv_1 = __importDefault(require('dotenv'));
const db_config_1 = require('./config/db.config');
dotenv_1.default.config();
// Database Connection
exports.dbPool = (0, db_config_1.createPool)();
const app = (0, express_1.default)();
const address = process.env.PORT || '0.0.0.0:3000';
app.use(body_parser_1.default.json());
app.get('/', function (req, res) {
  res.send('Hello World...!');
});
app.listen(3000, function () {
  console.log(`starting app on: ${address}`);
});
//# sourceMappingURL=server.js.map
