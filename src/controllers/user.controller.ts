import { UserStore } from '../models/user.model';
import { CreateUserDTO, User, RecentOrder } from '../types';
import client from '../config/database.config';

export class UserController {
  private store: UserStore;

  constructor() {
    this.store = new UserStore(client);
  }

  async create(
    userData: CreateUserDTO
  ): Promise<Omit<User, 'password_digest'>> {
    try {
      // Check for existing email before creating
      const existingUser = await this.store.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('Email already exists');
      }
      return await this.store.create(userData);
    } catch (error) {
      // Propagate the error with its original message
      throw error;
    }
  }

  async index(): Promise<Omit<User, 'password_digest'>[]> {
    try {
      return await this.store.index();
    } catch (error) {
      throw new Error(`Error retrieving users: ${error}`);
    }
  }

  async show(id: number): Promise<Omit<User, 'password_digest'>> {
    try {
      const user = await this.store.show(id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: number,
    userData: Partial<Omit<CreateUserDTO, 'password'>>
  ): Promise<Omit<User, 'password_digest'>> {
    try {
      // If updating email, check for conflicts
      if (userData.email) {
        const conn = await client.connect();
        try {
          // We need to check for existing email, excluding the current user
          const result = await conn.query(
            'SELECT id FROM users WHERE email = $1 AND id != $2',
            [userData.email, id]
          );

          if (result.rows.length > 0) {
            throw new Error('Email already exists');
          }
        } finally {
          conn.release();
        }
      }

      return await this.store.update(id, userData);
    } catch (error) {
      // Make sure to propagate the error with its message intact
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred during update');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.store.delete(id);
    } catch (error) {
      throw new Error(`Error deleting user: ${error}`);
    }
  }

  async getRecentOrders(userId: number): Promise<RecentOrder[]> {
    try {
      return await this.store.getRecentOrders(userId);
    } catch (error) {
      throw new Error(`Error retrieving recent orders: ${error}`);
    }
  }
}
