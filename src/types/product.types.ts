// Product Types & DTO for creating new records
interface Product {
  id: number;
  product_name: string;
  price: number;
  category: 'headphones' | 'speakers' | 'earphones';
  product_desc?: string;
  image_name: string;
  product_features: string[];
  product_accessories: string[];
}

interface CreateProductDTO {
  product_name: string;
  price: number;
  category: 'headphones' | 'speakers' | 'earphones';
  product_desc?: string;
  image_name: string;
  product_features: string[];
  product_accessories: string[];
}
