import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { Navbar } from '@/public-app/components/common/Navbar/Navbar';
import { Loading } from '@/public-app/components/common/Loading/Loading';
import { Error } from '@/public-app/components/common/Error/Error';
import { useMenu } from '../hooks/useMenu';
import { PublicAppProvider } from '../contexts/PublicAppContext';
import './PublicLayout.css';

export const PublicLayout: React.FC = () => {
  const { restaurantSlug } = useParams<{
    restaurantSlug: string;
  }>();

  const { menuData, loading, error } = useMenu(restaurantSlug!);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} />;
  }

  if (!menuData) {
    return <Error message="Restaurant not available" />;
  }

  return (
    <PublicAppProvider
      value={{
        menuData,
        restaurantSlug: restaurantSlug!,
      }}
    >
      <div className="public-layout">
        <Navbar restaurant={menuData.restaurant} />
        <main className="public-main">
          <Outlet />
        </main>
      </div>
    </PublicAppProvider>
  );
};
