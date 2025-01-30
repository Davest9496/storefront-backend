import { Request, Response } from 'express';
import { Pool } from 'pg';
import { ProductStore } from '../models/product.model';
import { CreateProductDTO, ProductCategory } from '../types';
import client from '../config/database.config';

export class ProductController {
  private store: ProductStore;

  constructor(dbClient: Pool = client) {
    this.store = new ProductStore(dbClient);
  }

  // GET /api/products
  async index(_req: Request, res: Response): Promise<void> {
    try {
      const products = await this.store.index();
      res.json(products);
    } catch (error) {
      console.error('Error getting products:', error);
      res.status(500).json({
        error: 'Could not retrieve products',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // GET /api/products/:id
  async show(req: Request, res: Response): Promise<void> {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        res.status(400).json({ error: 'Invalid product ID' });
        return;
      }

      try {
        const product = await this.store.show(productId);
        res.json(product);
      } catch (err) {
        if (err instanceof Error && err.message.includes('not found')) {
          res.status(404).json({ error: 'Product not found' });
          return;
        }
        throw err;
      }
    } catch (error) {
      console.error('Error getting product:', error);
      res.status(500).json({
        error: 'Could not retrieve product',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // POST /api/products
  async create(req: Request, res: Response): Promise<void> {
    try {
      const productData: CreateProductDTO = {
        product_name: req.body.product_name,
        price: parseFloat(req.body.price),
        category: req.body.category,
        product_desc: req.body.product_desc,
        image_name: req.body.image_name,
        product_features: req.body.product_features,
        product_accessories: req.body.product_accessories,
      };

      // Validate required fields
      if (!this.validateProductData(productData)) {
        res.status(400).json({ error: 'Missing or invalid required fields' });
        return;
      }

      const newProduct = await this.store.create(productData);
      res.status(201).json(newProduct);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({
        error: 'Could not create product',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // GET /api/products/category/:category
  async getByCategory(req: Request, res: Response): Promise<void> {
    try {
      const category = req.params.category as ProductCategory;
      if (!this.isValidCategory(category)) {
        res.status(400).json({ error: 'Invalid product category' });
        return;
      }

      const products = await this.store.getByCategory(category);
      res.json(products);
    } catch (error) {
      console.error('Error getting products by category:', error);
      res.status(500).json({
        error: 'Could not retrieve products',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // GET /api/products/popular
  async getPopularProducts(_req: Request, res: Response): Promise<void> {
    try {
      const products = await this.store.getPopularProducts(5);
      res.json(products);
    } catch (error) {
      console.error('Error getting popular products:', error);
      res.status(500).json({
        error: 'Could not retrieve popular products',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private validateProductData(data: CreateProductDTO): boolean {
    return !!(
      data.product_name &&
      typeof data.product_name === 'string' &&
      data.price &&
      typeof data.price === 'number' &&
      data.price > 0 &&
      this.isValidCategory(data.category) &&
      data.image_name &&
      Array.isArray(data.product_features) &&
      Array.isArray(data.product_accessories)
    );
  }

  private isValidCategory(category: string): category is ProductCategory {
    return ['headphones', 'speakers', 'earphones'].includes(category);
  }
}
