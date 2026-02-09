import React from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '../../components/common/Navbar/Navbar';
import { BottomNav } from '../../components/common/BottomNav/BottomNav';
import { Loading } from '../../components/common/Loading/Loading';
import { Error } from '../../components/common/Error/Error';
import { useMenu } from '../../hooks/useMenu';
import './OrdersPage.css';

export const OrdersPage: React.FC = () => {
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
    <div className="orders-page">
      <Navbar restaurant={menuData.restaurant} table={menuData.table} />

      <main className="orders-page-content">
        <div className="orders-container">
          <h2>Hello World</h2>
        </div>
      </main>

      <BottomNav
        restaurantSlug={restaurantSlug!}
        branchCode={branchCode!}
        qrCode={qrCode}
        cartItemCount={0}
      />
    </div>
  );
};