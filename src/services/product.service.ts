// import { PoolClient } from 'pg';
// import { ProductModel } from '../models/product.model';
// import {
//   CreateProductDTO,
//   Product,
//   ProductWithOrders,
// } from '../types/product.types';

// export class ProductService {
//   private productModel: ProductModel;

//   constructor(private client: PoolClient) {
//     this.productModel = new ProductModel(client);
//   }

//   async getAllProducts(): Promise<Product[]> {
//     const products = await this.productModel.findAll();
//     const accessories = await this.productModel.getAccessories(
//       products.map((p) => p.id)
//     );

//     return products.map((product) => ({
//       ...product,
//       accessories: accessories[product.id] || [],
//     }));
//   }

//   async getProductById(id: number): Promise<Product | null> {
//     const product = await this.productModel.findById(id);
//     if (!product) return null;

//     const accessories = await this.productModel.getAccessories([id]);
//     return {
//       ...product,
//       accessories: accessories[id] || [],
//     };
//   }

//   async getProductsByCategory(category: string): Promise<Product[]> {
//     if (!this.isValidCategory(category)) {
//       throw new Error('Invalid category');
//     }

//     const products = await this.productModel.findByCategory(category);
//     const accessories = await this.productModel.getAccessories(
//       products.map((p) => p.id)
//     );

//     return products.map((product) => ({
//       ...product,
//       accessories: accessories[product.id] || [],
//     }));
//   }

//   async getTopProducts(): Promise<ProductWithOrders[]> {
//     const products = await this.productModel.getTopProducts();
//     const accessories = await this.productModel.getAccessories(
//       products.map((p) => p.id)
//     );

//     return products.map((product) => ({
//       ...product,
//       accessories: accessories[product.id] || [],
//     }));
//   }

//   async createProduct(productData: CreateProductDTO): Promise<Product | null> {
//     this.validateProductData(productData);

//     await this.client.query('BEGIN');
//     try {
//       const productId = await this.productModel.create(productData);

//       if (productData.accessories?.length) {
//         for (const accessory of productData.accessories) {
//           await this.productModel.addAccessory(productId, accessory);
//         }
//       }

//       await this.client.query('COMMIT');
//       return this.getProductById(productId);
//     } catch (error) {
//       await this.client.query('ROLLBACK');
//       throw error;
//     }
//   }

//   private validateProductData(data: CreateProductDTO): void {
//     if (!data.product_name || !data.price || !data.category) {
//       throw new Error('Missing required fields');
//     }
//     if (data.price <= 0) {
//       throw new Error('Price must be greater than 0');
//     }
//     if (!this.isValidCategory(data.category)) {
//       throw new Error('Invalid category');
//     }
//   }

//   private isValidCategory(category: string): boolean {
//     return ['headphones', 'speakers', 'earphones'].includes(category);
//   }
// }
