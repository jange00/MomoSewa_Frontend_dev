/**
 * Valid Product Categories
 * These categories must match the backend validation enum exactly.
 * 
 * Backend accepts these exact values (case-sensitive):
 * - "Steamed" (with capital S)
 * - "Fried"
 * - "Special"
 * - "Combo"
 * 
 * DO NOT use:
 * - lowercase: "steamed", "fried" ❌
 * - other values: "Momo", "Appetizer", etc. ❌
 */

export const PRODUCT_CATEGORIES = [
  'Steamed',
  'Fried',
  'Special',
  'Combo',
];

// Default category
export const DEFAULT_CATEGORY = 'Steamed';

// Validate if a category is valid
export const isValidCategory = (category) => {
  return PRODUCT_CATEGORIES.includes(category);
};

// Get category display name (for future use if needed)
export const getCategoryDisplayName = (category) => {
  return category || DEFAULT_CATEGORY;
};

