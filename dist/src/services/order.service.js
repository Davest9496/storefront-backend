"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const order_model_1 = require("../models/order.model");
class OrderService {
    constructor(client) {
        this.client = client;
        this.orderModel = new order_model_1.OrderModel(client);
    }
    async getCurrentOrder(userId) {
        return this.orderModel.getCurrentOrder(userId);
    }
    async getCompletedOrders(userId) {
        return this.orderModel.getCompletedOrders(userId);
    }
    async createOrder(orderData) {
        try {
            await this.client.query('BEGIN');
            const orderId = await this.orderModel.create(orderData);
            await this.orderModel.addProducts(orderId, orderData.products);
            await this.client.query('COMMIT');
            return orderId;
        }
        catch (error) {
            await this.client.query('ROLLBACK');
            throw error;
        }
    }
    async updateOrderStatus(orderId, status) {
        return this.orderModel.updateStatus(orderId, status);
    }
}
exports.OrderService = OrderService;
//# sourceMappingURL=order.service.js.map