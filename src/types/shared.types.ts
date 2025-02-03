export type OrderStatus = 'active' | 'complete';
export type ProductCategory = 'headphones' | 'speakers' | 'earphones';

export interface Product {
  id?: number;
  product_name: string;
  price: number;
  category: ProductCategory;
  product_desc?: string;
  image_name: string;
  product_features: string[];
  product_accessories: string[];
}

export interface User {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  password_digest: string;
}

export interface Order {
  id?: number;
  user_id: number;
  status: OrderStatus;
}

export interface OrderProduct {
  id?: number;
  order_id: number;
  product_id: number;
  quantity: number;
}

// Adding the new interfaces for recent orders feature
export interface OrderProductDetail {
  product_id: number;
  quantity: number;
}

export interface RecentOrder {
  id: number;
  status: OrderStatus;
  products: OrderProductDetail[];
}

export interface UpdateUserDTO {
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface UpdatePasswordDTO {
  current_password: string;
  new_password: string;
}


// DTO interfaces
export interface CreateProductDTO extends Omit<Product, 'id'> {}

export interface CreateUserDTO extends Omit<User, 'id' | 'password_digest'> {
  password: string;
}

export interface CreateOrderDTO extends Omit<Order, 'id'> {}

export interface CreateOrderProductDTO extends Omit<OrderProduct, 'id'> {}
