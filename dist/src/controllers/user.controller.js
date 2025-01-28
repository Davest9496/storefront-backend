"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const server_1 = require("../server");
const user_service_1 = require("../services/user.service");
class UserController {
    static async getUsers(req, res) {
        const client = await server_1.dbPool.connect();
        try {
            const userService = new user_service_1.UserService(client);
            const users = await userService.getAllUsers();
            res.json(users);
        }
        catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
        finally {
            client.release();
        }
    }
    static async getUserById(req, res) {
        const userId = parseInt(req.params.id);
        const client = await server_1.dbPool.connect();
        try {
            const userService = new user_service_1.UserService(client);
            const user = await userService.getProfile(userId);
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.json(user);
        }
        catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
        finally {
            client.release();
        }
    }
    static async updateUser(req, res) {
        const userId = parseInt(req.params.id);
        if (req.user?.id !== userId) {
            res.status(403).json({ error: 'Unauthorized to update this user' });
            return;
        }
        const client = await server_1.dbPool.connect();
        try {
            const userService = new user_service_1.UserService(client);
            const updatedUser = await userService.updateProfile(userId, req.body);
            if (!updatedUser) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.json(updatedUser);
        }
        catch (error) {
            console.error('Error updating user:', error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
        finally {
            client.release();
        }
    }
    static async deleteUser(req, res) {
        const userId = parseInt(req.params.id);
        if (req.user?.id !== userId) {
            res.status(403).json({ error: 'Unauthorized to delete this user' });
            return;
        }
        const client = await server_1.dbPool.connect();
        try {
            const userService = new user_service_1.UserService(client);
            await userService.deleteAccount(userId);
            res.json({ message: 'User successfully deleted' });
        }
        catch (error) {
            console.error('Error deleting user:', error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
        finally {
            client.release();
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map