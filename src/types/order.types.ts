// Order Types
interface Order {
  id: number;
  user_id: number;
  status: 'active' | 'complete';
  products: OrderProduct[];
}

interface OrderProduct {
  id: number;
  product_id: number;
  quantity: number;
  product?: Product; 
}

interface CreateOrderDTO {
  user_id: number;
  products: {
    product_id: number;
    quantity: number;
  }[];
}
