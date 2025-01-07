// Product Types & DTO for creating new records
export interface Product {
  id: number;
  product_name: string;
  price: number;
  category: 'headphones' | 'speakers' | 'earphones';
  product_desc: string | null;
  image_name: string;
  features: string[];
  accessories?: ProductAccessory[];
}

export interface CreateProductDTO {
  product_name: string;
  price: number;
  category: 'headphones' | 'speakers' | 'earphones';
  product_desc?: string;
  image_name: string;
  features: string[];
  accessories?: ProductAccessory[];
}

export interface ProductAccessory {
  item_name: string;
  quantity: number;
}

export interface AccessoryMap {
  [productId: number]: ProductAccessory[];
}

export interface ProductWithOrders extends Product {
  total_ordered: number;
}
