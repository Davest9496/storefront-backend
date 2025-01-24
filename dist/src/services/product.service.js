"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const product_model_1 = require("../models/product.model");
class ProductService {
    constructor(client) {
        this.client = client;
        this.productModel = new product_model_1.ProductModel(client);
    }
    async getAllProducts() {
        const products = await this.productModel.findAll();
        const accessories = await this.productModel.getAccessories(products.map((p) => p.id));
        return products.map((product) => ({
            ...product,
            accessories: accessories[product.id] || [],
        }));
    }
    async getProductById(id) {
        const product = await this.productModel.findById(id);
        if (!product)
            return null;
        const accessories = await this.productModel.getAccessories([id]);
        return {
            ...product,
            accessories: accessories[id] || [],
        };
    }
    async getProductsByCategory(category) {
        if (!this.isValidCategory(category)) {
            throw new Error('Invalid category');
        }
        const products = await this.productModel.findByCategory(category);
        const accessories = await this.productModel.getAccessories(products.map((p) => p.id));
        return products.map((product) => ({
            ...product,
            accessories: accessories[product.id] || [],
        }));
    }
    async getTopProducts() {
        const products = await this.productModel.getTopProducts();
        const accessories = await this.productModel.getAccessories(products.map((p) => p.id));
        return products.map((product) => ({
            ...product,
            accessories: accessories[product.id] || [],
        }));
    }
    async createProduct(productData) {
        this.validateProductData(productData);
        await this.client.query('BEGIN');
        try {
            const productId = await this.productModel.create(productData);
            if (productData.accessories?.length) {
                for (const accessory of productData.accessories) {
                    await this.productModel.addAccessory(productId, accessory);
                }
            }
            await this.client.query('COMMIT');
            return this.getProductById(productId);
        }
        catch (error) {
            await this.client.query('ROLLBACK');
            throw error;
        }
    }
    validateProductData(data) {
        if (!data.product_name || !data.price || !data.category) {
            throw new Error('Missing required fields');
        }
        if (data.price <= 0) {
            throw new Error('Price must be greater than 0');
        }
        if (!this.isValidCategory(data.category)) {
            throw new Error('Invalid category');
        }
    }
    isValidCategory(category) {
        return ['headphones', 'speakers', 'earphones'].includes(category);
    }
}
exports.ProductService = ProductService;
//# sourceMappingURL=product.service.js.map