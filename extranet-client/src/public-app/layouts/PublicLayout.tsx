import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar/Navbar';
import { BottomNav } from '../components/common/BottomNav/BottomNav';
import { Loading } from '../components/common/Loading/Loading';
import { Error } from '../components/common/Error/Error';
import { useMenu } from '../hooks/useMenu';
import { PublicAppProvider } from '../contexts/PublicAppContext';
import './PublicLayout.css';

export const PublicLayout: React.FC = () => {
  const { restaurantSlug, branchCode, qrCode } = useParams<{
    restaurantSlug: string;
    branchCode: string;
    qrCode?: string;
  }>();

  const { menuData, loading, error } = useMenu(restaurantSlug!, branchCode!, qrCode);

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
        branchCode: branchCode!,
        qrCode,
      }}
    >
      <div className="public-layout">
        <Navbar restaurant={menuData.restaurant} table={menuData.table} />

        <main className="public-main">
          <Outlet />
        </main>

        <BottomNav
          restaurantSlug={restaurantSlug!}
          branchCode={branchCode!}
          qrCode={qrCode}
          cartItemCount={0}
        />
      </div>
    </PublicAppProvider>
  );
};