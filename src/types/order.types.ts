import { Product } from './product.types';

export type OrderStatus = 'active' | 'complete';
export type ProductCategory = 'headphones' | 'speakers' | 'earphones';

export interface OrderProduct {
  id?: number;
  product_id: number;
  quantity: number;
  product?: Product
}

export interface Order {
  id: number;
  user_id: number;
  status: OrderStatus;
  products: OrderProduct[];
}

export interface CreateOrderDTO {
  userId: number;
  products: Array<{
    productId: number;
    quantity: number;
  }>;
}

export interface UpdateOrderStatusDTO {
  status: OrderStatus;
}
