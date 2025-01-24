export interface OrderProduct {
  id?: number;
  product_id: number;
  quantity: number;
  product?: {
    product_name: string;
    price: number;
  };
}

export interface Order {
  id: number;
  user_id: number;
  status: 'active' | 'complete';
  products: OrderProduct[];
}

export interface CreateOrderDTO {
  userId: number;
  products: {
    productId: number;
    quantity: number;
  }[];
}

export interface OrderStatus {
  status: 'active' | 'complete';
}
