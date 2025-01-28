"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const product_model_1 = require("../../../src/models/product.model");
describe('ProductModel Integration Tests', () => {
    let productModel;
    let mockClient;
    beforeEach(() => {
        mockClient = {
            query: jasmine
                .createSpy('query')
                .and.returnValue(Promise.resolve({ rows: [] })),
        };
        productModel = new product_model_1.ProductModel(mockClient);
    });
    describe('findAll', () => {
        it('should return all products', async () => {
            const mockProducts = [
                {
                    id: 1,
                    product_name: 'Test Headphones',
                    price: 299.99,
                    category: 'headphones',
                    product_desc: 'Test description',
                    features: ['Feature 1'],
                },
            ];
            mockClient.query = jasmine
                .createSpy()
                .and.returnValue(Promise.resolve({ rows: mockProducts }));
            const result = await productModel.findAll();
            expect(mockClient.query).toHaveBeenCalled();
            expect(result).toEqual(mockProducts);
        });
    });
    describe('findById', () => {
        it('should return product by id', async () => {
            const mockProduct = {
                id: 1,
                product_name: 'Test Headphones',
                price: 299.99,
                category: 'headphones',
                product_desc: 'Test description',
                features: ['Feature 1'],
            };
            mockClient.query = jasmine
                .createSpy()
                .and.returnValue(Promise.resolve({ rows: [mockProduct] }));
            const result = await productModel.findById(1);
            expect(mockClient.query).toHaveBeenCalled();
            expect(result).toEqual(mockProduct);
        });
        it('should return null if product not found', async () => {
            mockClient.query = jasmine
                .createSpy()
                .and.returnValue(Promise.resolve({ rows: [] }));
            const result = await productModel.findById(999);
            expect(result).toBeNull();
        });
    });
    describe('findByCategory', () => {
        it('should return products by category', async () => {
            const mockProducts = [
                {
                    id: 1,
                    product_name: 'Test Headphones',
                    price: 299.99,
                    category: 'headphones',
                    product_desc: 'Test description',
                    features: ['Feature 1'],
                },
            ];
            mockClient.query = jasmine
                .createSpy()
                .and.returnValue(Promise.resolve({ rows: mockProducts }));
            const result = await productModel.findByCategory('headphones');
            expect(mockClient.query).toHaveBeenCalled();
            const callArgs = mockClient.query.calls.first().args;
            expect(callArgs[1]).toEqual(['headphones']);
            expect(result).toEqual(mockProducts);
        });
    });
    describe('getTopProducts', () => {
        it('should return top 5 products with order counts', async () => {
            const mockProducts = [
                {
                    id: 1,
                    product_name: 'Test Headphones',
                    price: 299.99,
                    category: 'headphones',
                    product_desc: 'Test description',
                    features: ['Feature 1'],
                    total_ordered: 50,
                },
            ];
            mockClient.query = jasmine
                .createSpy()
                .and.returnValue(Promise.resolve({ rows: mockProducts }));
            const result = await productModel.getTopProducts();
            expect(mockClient.query).toHaveBeenCalled();
            expect(result).toEqual(mockProducts);
        });
    });
    describe('create', () => {
        it('should create a new product and return its id', async () => {
            const productData = {
                product_name: 'New Headphones',
                price: 199.99,
                category: 'headphones',
                product_desc: 'New description',
                features: ['Feature 1'],
                accessories: [{ item_name: 'Cable', quantity: 1 }],
            };
            mockClient.query = jasmine
                .createSpy()
                .and.returnValue(Promise.resolve({ rows: [{ id: 1 }] }));
            const result = await productModel.create(productData);
            expect(mockClient.query).toHaveBeenCalled();
            const callArgs = mockClient.query.calls.first().args;
            expect(callArgs[1]).toEqual([
                productData.product_name,
                productData.price,
                productData.category,
                productData.product_desc,
                productData.features,
            ]);
            expect(result).toBe(1);
        });
    });
    describe('getAccessories', () => {
        it('should return accessories grouped by product id', async () => {
            const mockAccessories = [
                {
                    product_id: 1,
                    accessories: [{ item_name: 'Cable', quantity: 1 }],
                },
            ];
            mockClient.query = jasmine
                .createSpy()
                .and.returnValue(Promise.resolve({ rows: mockAccessories }));
            const result = await productModel.getAccessories([1]);
            expect(mockClient.query).toHaveBeenCalled();
            const callArgs = mockClient.query.calls.first().args;
            expect(callArgs[1]).toEqual([[1]]);
            expect(result).toEqual({ 1: mockAccessories[0].accessories });
        });
    });
    describe('addAccessory', () => {
        it('should add an accessory to a product', async () => {
            const accessory = { item_name: 'Cable', quantity: 1 };
            await productModel.addAccessory(1, accessory);
            expect(mockClient.query).toHaveBeenCalled();
            const callArgs = mockClient.query.calls.first().args;
            expect(callArgs[1]).toEqual([1, accessory.item_name, accessory.quantity]);
        });
    });
});
//# sourceMappingURL=product.model.spec.js.map