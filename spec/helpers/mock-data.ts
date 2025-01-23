export const testProducts = [
  {
    product_name: 'Test Headphones',
    price: 299.99,
    category: 'headphones',
    product_desc: 'Test description',
    image_name: 'test-image.jpg',
    product_features: ['Feature 1', 'Feature 2'],
    product_accessories: ['Accessory 1', 'Accessory 2'],
  },
  {
    product_name: 'Test Speakers',
    price: 399.99,
    category: 'speakers',
    product_desc: 'Test speaker description',
    image_name: 'speaker-test.jpg',
    product_features: ['Speaker Feature 1', 'Speaker Feature 2'],
    product_accessories: ['Speaker Accessory 1', 'Speaker Accessory 2'],
  },
];

export const testOrders = [
  {
    user_id: 1,
    status: 'complete',
    products: [
      { product_id: 1, quantity: 2 },
      { product_id: 2, quantity: 1 },
    ],
  },
];
