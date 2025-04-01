/**
 * Converts a product name to a kebab-case ID string
 * Example: "XX99 Mark II Headphones" -> "xx99-mark-ii"
 */
export const generateProductId = (productName: string): string => {
  // Convert to lowercase
  let id = productName.toLowerCase();

  // Remove "headphones", "speaker", "earphones" suffix if present
  const categories = [
    'headphones',
    'speaker',
    'speakers',
    'earphone',
    'earphones',
  ];
  categories.forEach((category) => {
    if (id.includes(category)) {
      id = id.replace(category, '').trim();
    }
  });

  // Replace spaces and special characters with hyphens
  id = id.replace(/[^\w\s-]/g, ''); // Remove special characters except hyphens
  id = id.replace(/\s+/g, '-'); // Replace spaces with hyphens
  id = id.replace(/-+/g, '-'); // Replace multiple hyphens with a single hyphen
  id = id.replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens

  return id;
};

/**
 * Usage example:
 *
 * const productName = "XX99 Mark II Headphones";
 * const productId = generateProductId(productName);
 * console.log(productId);  // "xx99-mark-ii"
 */
