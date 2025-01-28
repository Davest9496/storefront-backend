"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const server_1 = require("../server");
const order_service_1 = require("../services/order.service");
class OrderController {
    static async createOrder(req, res) {
        const { user_id, products } = req.body;
        // Validate required fields
        if (!user_id || !Array.isArray(products) || products.length === 0) {
            res.status(400).json({ error: 'Invalid order data' });
            return;
        }
        // Validate products array structure
        const validProducts = products.every((p) => p.product_id && typeof p.quantity === 'number' && p.quantity > 0);
        if (!validProducts) {
            res.status(400).json({ error: 'Invalid product data' });
            return;
        }
        const client = await server_1.dbPool.connect();
        try {
            const orderService = new order_service_1.OrderService(client);
            const order = await orderService.createOrder({
                userId: user_id,
                products: products,
            });
            res.status(201).json(order);
        }
        catch (error) {
            console.error('Error creating order:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
        finally {
            client.release();
        }
    }
    static async getCurrentOrder(req, res) {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            res.status(400).json({ error: 'Invalid user ID' });
            return;
        }
        const client = await server_1.dbPool.connect();
        try {
            const orderService = new order_service_1.OrderService(client);
            const order = await orderService.getCurrentOrder(userId);
            if (!order) {
                res.status(404).json({ error: 'No active order found' });
                return;
            }
            res.status(200).json(order);
        }
        catch (error) {
            console.error('Error fetching current order:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
        finally {
            client.release();
        }
    }
    static async getCompletedOrders(req, res) {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            res.status(400).json({ error: 'Invalid user ID' });
            return;
        }
        const client = await server_1.dbPool.connect();
        try {
            const orderService = new order_service_1.OrderService(client);
            const orders = await orderService.getCompletedOrders(userId);
            res.status(200).json(orders);
        }
        catch (error) {
            console.error('Error fetching completed orders:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
        finally {
            client.release();
        }
    }
    static async updateOrderStatus(req, res) {
        const orderId = parseInt(req.params.id);
        const { status } = req.body;
        if (isNaN(orderId)) {
            res.status(400).json({ error: 'Invalid order ID' });
            return;
        }
        if (!status || !['active', 'complete'].includes(status)) {
            res.status(400).json({ error: 'Invalid status value' });
            return;
        }
        const client = await server_1.dbPool.connect();
        try {
            const orderService = new order_service_1.OrderService(client);
            const success = await orderService.updateOrderStatus(orderId, status);
            if (!success) {
                res.status(404).json({ error: 'Order not found' });
                return;
            }
            res.status(200).json({ message: 'Order status updated successfully' });
        }
        catch (error) {
            console.error('Error updating order status:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
        finally {
            client.release();
        }
    }
}
exports.OrderController = OrderController;
//# sourceMappingURL=order.controller.js.map