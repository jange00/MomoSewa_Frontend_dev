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

// Valid Product Subcategories
// These are the fixed subcategory values accepted by the backend
export const PRODUCT_SUBCATEGORIES = [
  'veg',
  'chicken',
  'buff',
  'pork',
  'mutton',
  'seafood',
];

// Validate if a category is valid
export const isValidCategory = (category) => {
  return PRODUCT_CATEGORIES.includes(category);
};

// Validate if a subcategory is valid
export const isValidSubcategory = (subcategory) => {
  if (!subcategory || subcategory.trim() === '') return true; // Empty is valid (optional)
  return PRODUCT_SUBCATEGORIES.includes(subcategory.toLowerCase());
};

// Get category display name (for future use if needed)
export const getCategoryDisplayName = (category) => {
  return category || DEFAULT_CATEGORY;
};

// Get subcategory display name (capitalize first letter)
export const getSubcategoryDisplayName = (subcategory) => {
  if (!subcategory) return '';
  return subcategory.charAt(0).toUpperCase() + subcategory.slice(1);
};

