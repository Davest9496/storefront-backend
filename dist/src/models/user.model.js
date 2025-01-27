"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
class UserModel {
    constructor(client) {
        this.client = client;
    }
    async findAll() {
        const result = await this.client.query('SELECT id, first_name, last_name FROM users ORDER BY id ASC');
        return result.rows;
    }
    async findById(id) {
        const result = await this.client.query('SELECT id, first_name, last_name, email, password_digest FROM users WHERE id = $1', [id]);
        return result.rows[0] || null;
    }
    async findByEmail(email) {
        const result = await this.client.query('SELECT id, first_name, last_name, email, password_digest FROM users WHERE LOWER(email) = LOWER($1)', [email]);
        return result.rows[0] || null;
    }
    async create(userData, hashedPassword) {
        const result = await this.client.query(`INSERT INTO users (first_name, last_name, email, password_digest) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, first_name, last_name, email, password_digest`, [
            userData.first_name.trim(),
            userData.last_name.trim(),
            userData.email.trim(),
            hashedPassword,
        ]);
        return result.rows[0];
    }
    async update(id, data) {
        const setClause = Object.entries(data)
            .filter(([, value]) => value !== undefined)
            .map(([key], index) => `${key} = $${index + 2}`)
            .join(', ');
        const values = Object.values(data).filter((value) => value !== undefined);
        if (!values.length)
            return this.findById(id);
        const result = await this.client.query(`UPDATE users 
       SET ${setClause}
       WHERE id = $1
       RETURNING id, first_name, last_name, email, password_digest`, [id, ...values]);
        return result.rows[0] || null;
    }
    async updatePassword(id, hashedPassword) {
        const result = await this.client.query('UPDATE users SET password_digest = $1 WHERE id = $2', [hashedPassword, id]);
        return (result.rowCount ?? 0) > 0;
    }
    async delete(id) {
        const result = await this.client.query('DELETE FROM users WHERE id = $1', [
            id,
        ]);
        return (result.rowCount ?? 0) > 0;
    }
    async checkEmailExists(email) {
        const result = await this.client.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
        return result.rows.length > 0;
    }
}
exports.UserModel = UserModel;
//# sourceMappingURL=user.model.js.map