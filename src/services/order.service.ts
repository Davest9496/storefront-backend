import { PoolClient } from 'pg';
import { OrderModel } from '../models/order.model';
import {
  CreateOrderDTO,
  Order,
  OrderProduct,
  OrderStatus,
} from '../types/order.types';

export class OrderService {
  private orderModel: OrderModel;

  constructor(private client: PoolClient) {
    this.orderModel = new OrderModel(client);
  }

  async getCurrentOrder(userId: number): Promise<Order> {
    const order = await this.orderModel.findActiveOrder(userId);
    if (!order) {
      throw new Error('No active order found');
    }
    return order;
  }

  async getCompletedOrders(userId: number): Promise<Order[]> {
    return this.orderModel.findCompletedOrders(userId);
  }

  async createOrder(data: CreateOrderDTO): Promise<Order> {
    try {
      await this.client.query('BEGIN');

      const orderId = await this.orderModel.create(data.userId);

      for (const product of data.products) {
        await this.orderModel.addProduct(
          orderId,
          product.productId,
          product.quantity
        );
      }

      await this.client.query('COMMIT');

      const order = await this.orderModel.findById(orderId);
      if (!order) {
        throw new Error('Failed to create order');
      }

      return order;
    } catch (error) {
      await this.client.query('ROLLBACK');
      throw error;
    }
  }

  async addProduct(orderId: number, productData: OrderProduct): Promise<Order> {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'active') {
      throw new Error('Cannot modify completed order');
    }

    await this.orderModel.addProduct(
      orderId,
      productData.product_id,
      productData.quantity
    );

    const updatedOrder = await this.orderModel.findById(orderId);
    if (!updatedOrder) {
      throw new Error('Failed to add product to order');
    }

    return updatedOrder;
  }

  async updateOrderStatus(
    orderId: number,
    status: OrderStatus
  ): Promise<Order> {
    const updatedOrder = await this.orderModel.updateStatus(
      orderId,
      status.status
    );
    if (!updatedOrder) {
      throw new Error('Order not found');
    }
    return updatedOrder;
  }
}
