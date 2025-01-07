import { Request, Response } from 'express';
import { PoolClient } from 'pg';
import { dbPool } from '../server';
import {
  ProductAccessory,
  AccessoryMap,
  Product,
  ProductWithOrders,
  CreateProductDTO,
} from '../types/product.types'; 


// Fetch accessories for products
const getAccessoriesForProducts = async (
  client: PoolClient,
  productIds: number[]
): Promise<AccessoryMap> => {
  const accessoryResult = await client.query<{
    product_id: number;
    accessories: ProductAccessory[];
  }>(
    `SELECT 
            product_id,
            json_agg(
                json_build_object(
                    'item_name', item_name,
                    'quantity', quantity
                )
            ) as accessories
        FROM product_accessories
        WHERE product_id = ANY($1::int[])
        GROUP BY product_id`,
    [productIds]
  );

  return accessoryResult.rows.reduce((acc: AccessoryMap, row) => {
    acc[row.product_id] = row.accessories;
    return acc;
  }, {});
};

export const getProducts = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const client = await dbPool.connect();
    try {
      const productsResult = await client.query<Product>(
        'SELECT id, product_name, price, category, product_desc, image_name, features FROM products'
      );

      if (productsResult.rows.length > 0) {
        productsResult.rows = productsResult.rows.map((product) => ({
          ...product,
        }));
      }

      res.json(productsResult.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const productId = parseInt(req.params.id);
    const client = await dbPool.connect();

    try {
      const productResult = await client.query<Product>(
        'SELECT id, product_name, price, category, product_desc, image_name, features FROM products WHERE id = $1',
        [productId]
      );

      if (productResult.rows.length === 0) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      const accessoriesMap = await getAccessoriesForProducts(client, [
        productId,
      ]);

      const product = {
        ...productResult.rows[0],
        accessories: accessoriesMap[productId] || [],
      };

      res.json(product);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const client = await dbPool.connect();
  try {
    await client.query('BEGIN');

    const productData: CreateProductDTO = req.body;
    const {
      product_name,
      price,
      category,
      product_desc,
      image_name,
      features,
      accessories,
    } = productData;

    if (!product_name || !price || !category || !image_name) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    if (price <= 0) {
      res.status(400).json({ error: 'Price must be greater than 0' });
      return;
    }

    const validCategories: Array<'headphones' | 'speakers' | 'earphones'> = [
      'headphones',
      'speakers',
      'earphones',
    ];
    if (!validCategories.includes(category)) {
      res.status(400).json({ error: 'Invalid category' });
      return;
    }

    const productResult = await client.query<{ id: number }>(
      `INSERT INTO products 
            (product_name, price, category, product_desc, image_name, features)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id`,
      [product_name, price, category, product_desc, image_name, features]
    );

    const productId = productResult.rows[0].id;

    if (accessories && accessories.length > 0) {
      for (const accessory of accessories) {
        await client.query(
          `INSERT INTO product_accessories (product_id, item_name, quantity)
                    VALUES ($1, $2, $3)`,
          [productId, accessory.item_name, accessory.quantity]
        );
      }
    }

    await client.query('COMMIT');

    // Fetch the complete product with accessories
    await getProductById(
      { params: { id: productId.toString() } } as unknown as Request,
      res
    );
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

export const getTopProducts = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const client = await dbPool.connect();
    try {
      const productsResult = await client.query<ProductWithOrders>(
        `SELECT 
                    p.id,
                    p.product_name,
                    p.price,
                    p.category,
                    p.product_desc,
                    p.image_name,
                    p.features,
                    COALESCE(SUM(op.quantity), 0) as total_ordered
                FROM products p
                LEFT JOIN order_products op ON p.id = op.product_id
                GROUP BY p.id
                ORDER BY total_ordered DESC
                LIMIT 5`
      );

      if (productsResult.rows.length > 0) {
        const productIds = productsResult.rows.map((product) => product.id);
        const accessoriesMap = await getAccessoriesForProducts(
          client,
          productIds
        );

        productsResult.rows = productsResult.rows.map((product) => ({
          ...product,
          accessories: accessoriesMap[product.id] || [],
        }));
      }

      res.json(productsResult.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProductsByCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { category } = req.params;
    const validCategories: Array<'headphones' | 'speakers' | 'earphones'> = [
      'headphones',
      'speakers',
      'earphones',
    ];

    if (!validCategories.includes(category as 'headphones' | 'speakers' | 'earphones')) {
      res.status(400).json({ error: 'Invalid category' });
      return;
    }

    const client = await dbPool.connect();
    try {
      const productsResult = await client.query<Product>(
        `SELECT 
                    id, 
                    product_name,
                    price,
                    category,
                    product_desc,
                    image_name,
                    features
                FROM products
                WHERE category = $1`,
        [category]
      );

      if (productsResult.rows.length > 0) {
        const productIds = productsResult.rows.map((product) => product.id);
        const accessoriesMap = await getAccessoriesForProducts(
          client,
          productIds
        );

        productsResult.rows = productsResult.rows.map((product) => ({
          ...product,
          accessories: accessoriesMap[product.id] || [],
        }));
      }

      res.json(productsResult.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
