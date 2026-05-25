import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryGrid } from '@/public-app/components/menu/CategoryGrid/CategoryGrid';
import { SkeletonCategoryGrid } from '@/public-app/components/common/Skeleton/SkeletonCategoryGrid';
import { usePublicApp } from '@/public-app/contexts/PublicAppContext';
import { useCategories } from '@/public-app/hooks/useCategories';
import { Error } from '@/public-app/components/common/Error/Error';
import './CategoryPage.css';

export const CategoryPage: React.FC = () => {
  const { restaurantSlug, qrCode } = usePublicApp();
  const navigate = useNavigate();
  const { categories, loading, error } = useCategories(restaurantSlug);

  const handleCategoryClick = (categoryId: string) => {
    const basePath = qrCode
      ? `/menu/${restaurantSlug}/${qrCode}`
      : `/menu/${restaurantSlug}`;
    navigate(`${basePath}/items?category=${categoryId}`);
  };

  if (error) {
    return <Error message={error} />;
  }

  return (
    <div className="category-page-container">
      {loading ? (
        <SkeletonCategoryGrid />
      ) : (
        <CategoryGrid
          categories={categories}
          onCategoryClick={handleCategoryClick}
        />
      )}
    </div>
  );
};
