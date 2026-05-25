import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { Navbar } from '@/public-app/components/common/Navbar/Navbar';
import { Loading } from '@/public-app/components/common/Loading/Loading';
import { Error } from '@/public-app/components/common/Error/Error';
import { PublicAppProvider } from '../contexts/PublicAppContext';
import './PublicLayout.css';
import { useCategories } from '../hooks/useCateogry';

export const PublicLayout: React.FC = () => {
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();

  // Layout only needs restaurant info (name, logo) — comes from the category response
  const { data, loading, error } = useCategories(restaurantSlug!);

  if (loading) return <Loading />;
  if (error)   return <Error message={error} />;
  if (!data)   return <Error message="Restaurant not available" />;

  return (
    <PublicAppProvider
      value={{
        restaurant: data.restaurant,
        restaurantSlug: restaurantSlug!,
      }}
    >
      <div className="public-layout">
        <Navbar restaurant={data.restaurant} />
        <main className="public-main">
          <Outlet />
        </main>
      </div>
    </PublicAppProvider>
  );
};
