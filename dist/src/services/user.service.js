"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_model_1 = require("../models/user.model");
const auth_service_1 = require("./auth.service");
class UserService {
    constructor(client) {
        this.client = client;
        this.userModel = new user_model_1.UserModel(client);
    }
    async getAllUsers() {
        const users = await this.userModel.findAll();
        return users.map((user) => ({
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
        }));
    }
    async getProfile(userId) {
        const user = await this.userModel.findById(userId);
        if (!user)
            return null;
        return {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
        };
    }
    async updateProfile(userId, data) {
        if (data.email && !auth_service_1.AuthService.validateEmail(data.email)) {
            throw new Error('Invalid email format');
        }
        if (data.email) {
            const emailExists = await this.userModel.checkEmailExists(data.email);
            if (emailExists) {
                throw new Error('Email already in use');
            }
        }
        return this.userModel.update(userId, data);
    }
    async changePassword(userId, currentPassword, newPassword) {
        const passwordValidation = auth_service_1.AuthService.validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            throw new Error(passwordValidation.error || 'Invalid password');
        }
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const isValid = await auth_service_1.AuthService.verifyPassword(currentPassword, user.password_digest);
        if (!isValid) {
            throw new Error('Current password is incorrect');
        }
        const hashedPassword = await auth_service_1.AuthService.hashPassword(newPassword);
        return this.userModel.updatePassword(userId, hashedPassword);
    }
    async deleteAccount(userId) {
        const result = await this.userModel.delete(userId);
        if (!result) {
            throw new Error('Failed to delete account');
        }
        return true;
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map