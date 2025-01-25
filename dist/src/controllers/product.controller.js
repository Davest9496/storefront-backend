"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const server_1 = require("../server");
const product_service_1 = require("../services/product.service");
class ProductController {
    static async getProducts(_req, res) {
        const client = await server_1.dbPool.connect();
        try {
            const productService = new product_service_1.ProductService(client);
            const products = await productService.getAllProducts();
            res.json(products);
        }
        catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
        finally {
            client.release();
        }
    }
    static async getProductById(req, res) {
        const productId = parseInt(req.params.id);
        if (isNaN(productId)) {
            res.status(400).json({ error: 'Invalid product ID' });
            return;
        }
        const client = await server_1.dbPool.connect();
        try {
            const productService = new product_service_1.ProductService(client);
            const product = await productService.getProductById(productId);
            if (product) {
                res.json(product);
            }
            else {
                res.status(404).json({ error: 'Product not found' });
            }
        }
        catch (error) {
            console.error('Error fetching product:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
        finally {
            client.release();
        }
    }
    static async getTopProducts(_req, res) {
        const client = await server_1.dbPool.connect();
        try {
            const productService = new product_service_1.ProductService(client);
            const products = await productService.getTopProducts();
            res.json(products);
        }
        catch (error) {
            console.error('Error fetching top products:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
        finally {
            client.release();
        }
    }
    static async getProductsByCategory(req, res) {
        const { category } = req.params;
        const client = await server_1.dbPool.connect();
        try {
            const productService = new product_service_1.ProductService(client);
            const products = await productService.getProductsByCategory(category);
            res.json(products);
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Invalid category') {
                res.status(400).json({ error: 'Invalid category' });
            }
            else {
                console.error('Error fetching products by category:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        }
        finally {
            client.release();
        }
    }
    static async createProduct(req, res) {
        const client = await server_1.dbPool.connect();
        try {
            const productService = new product_service_1.ProductService(client);
            const product = await productService.createProduct(req.body);
            res.status(201).json(product);
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('required') ||
                    error.message.includes('Invalid')) {
                    res.status(400).json({ error: error.message });
                }
                else {
                    console.error('Error creating product:', error);
                    res.status(500).json({ error: 'Internal server error' });
                }
            }
        }
        finally {
            client.release();
        }
    }
}
exports.ProductController = ProductController;
//# sourceMappingURL=product.controller.js.map