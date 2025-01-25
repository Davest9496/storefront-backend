import { Request, Response } from 'express';
import { dbPool } from '../server';
import { ProductService } from '../services/product.service';

export class ProductController {
  static async getProducts(_req: Request, res: Response): Promise<void> {
    const client = await dbPool.connect();
    try {
      const productService = new ProductService(client);
      const products = await productService.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  }

  static async getProductById(req: Request, res: Response): Promise<void> {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      res.status(400).json({ error: 'Invalid product ID' });
      return;
    }

    const client = await dbPool.connect();
    try {
      const productService = new ProductService(client);
      const product = await productService.getProductById(productId);

      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ error: 'Product not found' });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  }

  static async getTopProducts(_req: Request, res: Response): Promise<void> {
    const client = await dbPool.connect();
    try {
      const productService = new ProductService(client);
      const products = await productService.getTopProducts();
      res.json(products);
    } catch (error) {
      console.error('Error fetching top products:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  }

  static async getProductsByCategory(
    req: Request,
    res: Response
  ): Promise<void> {
    const { category } = req.params;
    const client = await dbPool.connect();

    try {
      const productService = new ProductService(client);
      const products = await productService.getProductsByCategory(category);
      res.json(products);
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid category') {
        res.status(400).json({ error: 'Invalid category' });
      } else {
        console.error('Error fetching products by category:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    } finally {
      client.release();
    }
  }

  static async createProduct(req: Request, res: Response): Promise<void> {
    const client = await dbPool.connect();
    try {
      const productService = new ProductService(client);
      const product = await productService.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes('required') ||
          error.message.includes('Invalid')
        ) {
          res.status(400).json({ error: error.message });
        } else {
          console.error('Error creating product:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      }
    } finally {
      client.release();
    }
  }
}
