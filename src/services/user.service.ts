import { PoolClient } from 'pg';
import { UserModel } from '../models/user.model';
import { AuthService } from './auth.service';
import { UpdateUserDTO, UserProfile, UserResponse } from '../types/user.types';

export class UserService {
  private userModel: UserModel;

  constructor(private client: PoolClient) {
    this.userModel = new UserModel(client);
  }

  async getAllUsers(): Promise<UserResponse[]> {
    const users = await this.userModel.findAll();
    return users.map((user) => ({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
    }));
  }

  async getProfile(userId: number): Promise<UserResponse | null> {
    const user = await this.userModel.findById(userId);
    if (!user) return null;

    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
    };
  }

  async updateProfile(
    userId: number,
    data: UpdateUserDTO
  ): Promise<UserProfile | null> {
    if (data.email && !AuthService.validateEmail(data.email)) {
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

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    const passwordValidation = AuthService.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.error || 'Invalid password');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isValid = await AuthService.verifyPassword(
      currentPassword,
      user.password_digest
    );
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    const hashedPassword = await AuthService.hashPassword(newPassword);
    return this.userModel.updatePassword(userId, hashedPassword);
  }

  async deleteAccount(userId: number): Promise<boolean> {
    const result = await this.userModel.delete(userId);
    if (!result) {
      throw new Error('Failed to delete account');
    }
    return true;
  }
}
