import { Product } from './product.types';
// Order Types
export interface Order {
  id: number;
  user_id: number;
  status: 'active' | 'complete';
  products: OrderProduct[];
}

export interface OrderProduct {
  id: number;
  product_id: number;
  quantity: number;
  product?: Product;
}

export interface CreateOrderDTO {
  user_id: number;
  products: {
    product_id: number;
    quantity: number;
  }[];
}
