import { PoolClient } from 'pg';
import { OrderModel } from '../models/order.model';
import { Order, CreateOrderDTO, OrderStatus } from '../types/order.types';

export class OrderService {
  private orderModel: OrderModel;

  constructor(private client: PoolClient) {
    this.orderModel = new OrderModel(client);
  }

  async getCurrentOrder(userId: number): Promise<Order | null> {
    return this.orderModel.getCurrentOrder(userId);
  }

  async getCompletedOrders(userId: number): Promise<Order[]> {
    return this.orderModel.getCompletedOrders(userId);
  }

  async createOrder(orderData: CreateOrderDTO): Promise<number> {
    try {
      await this.client.query('BEGIN');

      const orderId = await this.orderModel.create(orderData);

      await this.orderModel.addProducts(orderId, orderData.products);

      await this.client.query('COMMIT');
      return orderId;
    } catch (error) {
      await this.client.query('ROLLBACK');
      throw error;
    }
  }

  async updateOrderStatus(
    orderId: number,
    status: OrderStatus
  ): Promise<boolean> {
    return this.orderModel.updateStatus(orderId, status);
  }
}
