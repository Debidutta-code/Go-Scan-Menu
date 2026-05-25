import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryGrid } from '@/public-app/components/menu/CategoryGrid/CategoryGrid';
import { SkeletonCategoryGrid } from '@/public-app/components/common/Skeleton/SkeletonCategoryGrid';
import { usePublicApp } from '@/public-app/contexts/PublicAppContext';
import { useMenu } from '@/public-app/contexts/MenuContext';
import { Error } from '@/public-app/components/common/Error/Error';
import './CategoryPage.css';

export const CategoryPage: React.FC = () => {
  const { restaurantSlug, qrCode } = usePublicApp();
  const { menu, loading, error } = useMenu();
  const navigate = useNavigate();

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
          categories={menu}
          onCategoryClick={handleCategoryClick}
        />
      )}
    </div>
  );
};
