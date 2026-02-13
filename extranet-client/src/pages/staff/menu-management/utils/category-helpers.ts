import { Category } from '../types/menu.types';

export type CategoryId = string | { _id: string; name: string };

export const getCategoryId = (categoryId: CategoryId): string => {
  if (typeof categoryId === 'string') return categoryId;
  if (categoryId && typeof categoryId === 'object' && '_id' in categoryId) {
    return categoryId._id;
  }
  return '';
};

export const getCategoryName = (categoryId: CategoryId, categories: Category[]): string => {
  if (typeof categoryId === 'object' && categoryId?.name) {
    return categoryId.name;
  }

  const category = categories.find((cat) => cat._id === getCategoryId(categoryId));
  return category?.name || 'Uncategorized';
};