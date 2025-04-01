// import { ProductStore } from '../../models/product.model';
// import {
//   Product,
//   ProductCategory,
//   CreateProductDTO,
// } from '../../types/shared.types';
// import { NotFoundError } from '../../utils/error.utils';
// import client from '../../config/database.config';

// describe('Product Model', () => {
//   const store = new ProductStore();

//   // Test product data matching CreateProductDTO
//   const testProduct: CreateProductDTO = {
//     product_name: 'Test Headphones',
//     price: 199.99,
//     category: 'headphones' as ProductCategory,
//     product_desc: 'Test description',
//     image_name: 'test-headphones',
//     product_features: ['Feature 1', 'Feature 2'],
//     product_accessories: ['Accessory 1', 'Accessory 2'],
//   };

//   let createdProduct: Product;

//   beforeAll(async () => {
//     try {
//       await client.query('DELETE FROM order_products');
//       await client.query('DELETE FROM orders');
//       await client.query('DELETE FROM products');
//     } catch (err) {
//       throw new Error(`Error cleaning database: ${err}`);
//     }
//   });

//   afterAll(async () => {
//     try {
//       await client.query('DELETE FROM order_products');
//       await client.query('DELETE FROM orders');
//       await client.query('DELETE FROM products');
//     } catch (err) {
//       throw new Error(`Error cleaning database: ${err}`);
//     }
//   });

//   describe('Method definitions', () => {
//     it('should have an index method', () => {
//       expect(store.index).toBeDefined();
//     });

//     it('should have a show method', () => {
//       expect(store.show).toBeDefined();
//     });

//     it('should have a create method', () => {
//       expect(store.create).toBeDefined();
//     });

//     it('should have an update method', () => {
//       expect(store.update).toBeDefined();
//     });

//     it('should have a delete method', () => {
//       expect(store.delete).toBeDefined();
//     });

//     it('should have a getByCategory method', () => {
//       expect(store.getByCategory).toBeDefined();
//     });

//     it('should have a getPopular method', () => {
//       expect(store.getPopular).toBeDefined();
//     });
//   });

//   describe('CRUD Operations', () => {
//     it('create method should add a product', async () => {
//       createdProduct = await store.create(testProduct);

//       expect(createdProduct).toBeDefined();
//       expect(createdProduct.id).toBeDefined();
//       expect(createdProduct.product_name).toBe(testProduct.product_name);
//       expect(parseFloat(createdProduct.price.toString())).toBe(
//         testProduct.price
//       );
//       expect(createdProduct.category).toBe(testProduct.category);
//     });

//     it('index method should return a list of products', async () => {
//       const result = await store.index();

//       expect(result).toBeDefined();
//       expect(result.length).toBe(1);
//       if (result[0].product_name) {
//         expect(result[0].product_name).toBe(testProduct.product_name);
//       }
//     });

//     it('show method should return the correct product', async () => {
//       const result = await store.show(createdProduct.id as number);

//       expect(result).toBeDefined();
//       expect(result.id).toBe(createdProduct.id);
//       if (result.product_name) {
//         expect(result.product_name).toBe(testProduct.product_name);
//       }
//     });

//     it('show method should throw NotFoundError for non-existent product', async () => {
//       try {
//         await store.show(999999);
//         fail('Expected NotFoundError to be thrown');
//       } catch (error) {
//         expect(error).toBeInstanceOf(NotFoundError);
//       }
//     });

//     it('update method should modify product', async () => {
//       const updatedName = 'Updated Headphones';
//       const updatedPrice = 299.99;

//       const updates: Required<
//         Pick<CreateProductDTO, 'product_name' | 'price'>
//       > = {
//         product_name: updatedName,
//         price: updatedPrice,
//       };

//       const result = await store.update(createdProduct.id as number, updates);

//       expect(result).toBeDefined();
//       if (result.product_name && result.price) {
//         expect(result.product_name).toBe(updatedName);
//         expect(parseFloat(result.price.toString())).toBe(updatedPrice);
//       }
//       // Check that other fields remain unchanged
//       expect(result.category).toBe(testProduct.category);
//     });

//     it('delete method should remove product', async () => {
//       await store.delete(createdProduct.id as number);

//       try {
//         await store.show(createdProduct.id as number);
//         fail('Expected NotFoundError to be thrown');
//       } catch (error) {
//         expect(error).toBeInstanceOf(NotFoundError);
//       }
//     });
//   });

//   describe('Category Operations', () => {
//     beforeEach(async () => {
//       // Create test products for category tests
//       await store.create({
//         ...testProduct,
//         product_name: 'Category Test Headphones 1',
//       });
//       await store.create({
//         ...testProduct,
//         product_name: 'Category Test Headphones 2',
//       });
//     });

//     afterEach(async () => {
//       await client.query('DELETE FROM products');
//     });

//     it('getByCategory should return products in specified category', async () => {
//       const result = await store.getByCategory('headphones');

//       expect(result).toBeDefined();
//       expect(result.length).toBeGreaterThan(0);
//       result.forEach((product) => {
//         if (product.category) {
//           expect(product.category).toBe('headphones');
//         }
//       });
//     });

//     it('getByCategory should return empty array for non-existent category', async () => {
//       const result = await store.getByCategory('speakers' as ProductCategory);

//       expect(result).toBeDefined();
//       expect(result.length).toBe(0);
//     });
//   });

//   describe('Popular Products', () => {
//     it('getPopular should return up to 5 products', async () => {
//       const result = await store.getPopular();

//       expect(result).toBeDefined();
//       expect(result.length).toBeLessThanOrEqual(5);
//     });
//   });

//   describe('Search Operations', () => {
//     beforeAll(async () => {
//       await store.create(testProduct);
//     });

//     afterAll(async () => {
//       await client.query('DELETE FROM products');
//     });

//     it('searchProducts should find products by name', async () => {
//       const result = await store.searchProducts('Headphones');

//       expect(result).toBeDefined();
//       expect(result.length).toBeGreaterThan(0);
//       result.forEach((product) => {
//         if (product.product_name) {
//           expect(product.product_name.toLowerCase()).toContain('headphones');
//         }
//       });
//     });

//     it('searchProducts should find products by description', async () => {
//       const result = await store.searchProducts('Test description');

//       expect(result).toBeDefined();
//       expect(result.length).toBeGreaterThan(0);
//     });

//     it('searchProducts should return empty array for no matches', async () => {
//       const result = await store.searchProducts('NonExistentProduct12345');

//       expect(result).toBeDefined();
//       expect(result.length).toBe(0);
//     });
//   });
// });
