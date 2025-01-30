// import { ProductStore } from '../../models/product.model';
// import { testDb } from '../helpers/database';
// import { TestHelper } from '../helpers/test-helper';
// import { Product, CreateProductDTO, ProductCategory } from '../types';

// describe('Product Model Tests', () => {
//   // Initialize store and test helper
//   const store = new ProductStore(testDb);
//   const testHelper = TestHelper.getInstance(testDb);

//   // Define test data with explicit types
//   let testProduct: CreateProductDTO;
//   let createdProduct: Product & { id: number };

//   // Reset database and test data before each test
//   beforeEach(async () => {
//     await testHelper.cleanTables();

//     // Initialize test product with all required fields
//     testProduct = {
//       product_name: 'XX99 Mark II Headphones',
//       price: 299.99,
//       category: 'headphones' as ProductCategory,
//       product_desc:
//         'The new XX99 Mark II headphones is the pinnacle of pristine audio.',
//       image_name: 'xx99-mark-2-headphones.jpg',
//       product_features: [
//         'Features a genuine leather head strap',
//         'Premium earcups for superior comfort',
//       ],
//       product_accessories: [
//         'Headphone Unit',
//         'Replacement Earcups',
//         'User Manual',
//       ],
//     };
//   });

//   // Verify the presence of required store methods
//   describe('Store Interface', () => {
//     type StoreMethod = keyof ProductStore;
//     const requiredMethods: StoreMethod[] = [
//       'index',
//       'show',
//       'create',
//       'getPopularProducts',
//       'getByCategory',
//     ];

//     requiredMethods.forEach((method) => {
//       it(`should have ${method} method defined`, () => {
//         expect(store[method]).toBeDefined();
//         expect(typeof store[method]).toBe('function');
//       });
//     });
//   });

//   describe('Product Creation', () => {
//     it('should create a new product with all fields properly typed', async () => {
//       const result = await store.create(testProduct);
//       createdProduct = result as Product & { id: number };

//       // Verify all fields maintain their proper types
//       expect(typeof createdProduct.id).toBe('number');
//       expect(typeof createdProduct.product_name).toBe('string');
//       expect(typeof createdProduct.price).toBe('number');
//       expect(createdProduct.category).toBe('headphones');
//       expect(Array.isArray(createdProduct.product_features)).toBe(true);
//       expect(Array.isArray(createdProduct.product_accessories)).toBe(true);

//       // Verify the data matches input
//       expect(createdProduct).toEqual({
//         ...testProduct,
//         id: createdProduct.id,
//       });
//     });

//     it('should handle decimal prices with numeric precision', async () => {
//       const precisePrice = 99.99;
//       const productWithPrecisePrice: CreateProductDTO = {
//         ...testProduct,
//         price: precisePrice,
//       };

//       const result = await store.create(productWithPrecisePrice);

//       expect(result.price).toBe(precisePrice);
//       expect(result.price).toBeCloseTo(precisePrice, 2);
//     });

//     it('should create product with only required fields', async () => {
//       const minimalProduct: CreateProductDTO = {
//         product_name: 'Basic Headphones',
//         price: 99.99,
//         category: 'headphones',
//         image_name: 'basic-headphones.jpg',
//         product_features: [],
//         product_accessories: [],
//       };

//       const result = await store.create(minimalProduct);
//       expect(result.id).toBeDefined();
//       expect(result.product_name).toBe(minimalProduct.product_name);
//       expect(result.product_features).toEqual([]);
//       expect(result.product_accessories).toEqual([]);
//     });

//     it('should reject invalid price values', async () => {
//       const invalidPrice = -10.0;
//       const invalidProduct: CreateProductDTO = {
//         ...testProduct,
//         price: invalidPrice,
//       };

//       await expectAsync(store.create(invalidProduct)).toBeRejectedWithError(
//         /Could not add new product/
//       );
//     });
//   });

//   describe('Product Retrieval', () => {
//     beforeEach(async () => {
//       const result = await store.create(testProduct);
//       createdProduct = result as Product & { id: number };
//     });

//     describe('index method', () => {
//       it('should return typed array of products', async () => {
//         const products = await store.index();

//         expect(Array.isArray(products)).toBe(true);
//         expect(products.length).toBeGreaterThan(0);
//         expect(products[0]).toEqual(createdProduct);
//       });

//       it('should return empty array for no products', async () => {
//         await testHelper.cleanTables();
//         const products = await store.index();
//         expect(products).toEqual([]);
//       });
//     });

//     describe('show method', () => {
//       it('should return product with correct types by id', async () => {
//         const product = await store.show(createdProduct.id);

//         expect(product).toEqual(createdProduct);
//         expect(typeof product.id).toBe('number');
//         expect(typeof product.price).toBe('number');
//         expect(product.category).toBe('headphones');
//       });

//       it('should handle non-existent product id', async () => {
//         const nonExistentId = 999;
//         await expectAsync(store.show(nonExistentId)).toBeRejectedWithError(
//           new RegExp(`Product with id ${nonExistentId} not found`)
//         );
//       });
//     });
//   });

//   describe('Category Operations', () => {
//     beforeEach(async () => {
//       // Create products in different categories
//       await Promise.all([
//         store.create(testProduct),
//         store.create({
//           ...testProduct,
//           product_name: 'Test Speakers',
//           category: 'speakers' as ProductCategory,
//         }),
//       ]);
//     });

//     it('should return products filtered by category with proper typing', async () => {
//       const category: ProductCategory = 'headphones';
//       const products = await store.getByCategory(category);

//       expect(products.length).toBe(1);
//       products.forEach((product) => {
//         expect(product.category).toBe(category);
//       });
//     });

//     it('should handle empty category results', async () => {
//       const emptyCategory: ProductCategory = 'earphones';
//       const products = await store.getByCategory(emptyCategory);
//       expect(products).toEqual([]);
//     });
//   });

//   describe('Popular Products', () => {
//     it('should respect product limit with proper typing', async () => {
//       const productLimit = 5;
//       const totalProducts = 7;

//       // Create multiple test products
//       for (let i = 0; i < totalProducts; i++) {
//         await store.create({
//           ...testProduct,
//           product_name: `Test Product ${i + 1}`,
//         });
//       }

//       const popularProducts = await store.getPopularProducts(productLimit);

//       expect(popularProducts.length).toBeLessThanOrEqual(productLimit);
//       popularProducts.forEach((product) => {
//         expect(product.id).toBeDefined();
//         expect(typeof product.price).toBe('number');
//       });
//     });
//   });
// });
