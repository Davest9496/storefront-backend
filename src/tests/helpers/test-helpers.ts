export const testUser = {
  email: 'test@example.com',
  password: 'password123',
  first_name: 'Test',
  last_name: 'User',
};

export const testProduct = {
  product_name: 'Test Headphones',
  price: 299.99,
  category: 'headphones',
  product_desc: 'High-quality test headphones',
  image_name: 'test-headphones',
  product_features: ['Feature 1', 'Feature 2'],
  product_accessories: ['Manual', 'Cable'],
};

// Helper function to create test user and get token
export async function createTestUserAndToken(): Promise<{
  userId: number;
  token: string;
}> {
  // Implementation depends on your auth service
  // This will be implemented in the auth tests
  return { userId: 1, token: 'test-token' };
}
