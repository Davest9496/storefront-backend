import { Product } from './product.types';
// Order Types
export interface OrderStatus {
  id: number;
  userId: number;
  status: 'active' | 'complete';
  products: OrderProduct[];
}

export interface OrderProduct {
  id: number;
  productId: number;
  quantity: number;
  product?: Product;
}

export interface CreateOrderDTO {
  userId: number;
  products: {
    productId: number;
    quantity: number;
  }[];
}
