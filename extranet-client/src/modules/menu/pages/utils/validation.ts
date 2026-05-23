export interface ValidationErrors {
  [key: string]: string;
}

export interface MenuItemFormData {
  name: string;
  categoryId: string;
  price: string;
  discountPrice?: string;
  itemType: 'food' | 'drink';
  dietaryType: string;
  isAvailable: boolean;
  isActive: boolean;
}

export const validateMenuItem = (formData: MenuItemFormData): ValidationErrors => {
  const newErrors: ValidationErrors = {};

  if (!formData.name.trim()) {
    newErrors.name = 'Menu item name is required';
  }

  if (!formData.categoryId) {
    newErrors.categoryId = 'Please select a category';
  }

  if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
    newErrors.price = 'Please enter a valid price';
  }

  if (formData.itemType === 'food' && !formData.dietaryType) {
    newErrors.dietaryType = 'Please select a dietary type for food items';
  }

  return newErrors;
};
