import React from 'react';
import { Outlet, useParams, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar/Navbar';
import { BottomNav } from '../components/common/BottomNav/BottomNav';
import { Loading } from '../components/common/Loading/Loading';
import { Error } from '../components/common/Error/Error';
import { useMenu } from '../hooks/useMenu';
import { PublicAppProvider } from '../contexts/PublicAppContext';
import { ChevronLeft } from 'lucide-react';
import './PublicLayout.css';

export const PublicLayout: React.FC = () => {
  const { restaurantSlug, branchCode, qrCode } = useParams<{
    restaurantSlug: string;
    branchCode: string;
    qrCode?: string;
  }>();

  const location = useLocation();
  const navigate = useNavigate();
  const { menuData, loading, error } = useMenu(restaurantSlug!, branchCode!, qrCode);

  // Check if we are inside a specific game (not the games list)
  const isInsideGame = location.pathname.includes('/games/') &&
    !location.pathname.endsWith('/games') &&
    !location.pathname.endsWith('/games/');

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} />;
  }

  if (!menuData) {
    return <Error message="Restaurant not available" />;
  }

  const handleBack = () => {
    const basePath = qrCode
      ? `/menu/${restaurantSlug}/${branchCode}/${qrCode}`
      : `/menu/${restaurantSlug}/${branchCode}`;
    navigate(`${basePath}/games`);
  };

  return (
    <PublicAppProvider
      value={{
        menuData,
        restaurantSlug: restaurantSlug!,
        branchCode: branchCode!,
        qrCode,
      }}
    >
      <div className={`public-layout ${isInsideGame ? 'in-game' : ''}`}>
        {!isInsideGame && <Navbar restaurant={menuData.restaurant} table={menuData.table} />}

        <main className="public-main">
          <Outlet />

          {isInsideGame && (
            <button className="game-back-button" onClick={handleBack}>
              <ChevronLeft size={24} />
              <span>Back</span>
            </button>
          )}
        </main>

        {!isInsideGame && (
          <BottomNav
            restaurantSlug={restaurantSlug!}
            branchCode={branchCode!}
            qrCode={qrCode}
            cartItemCount={0}
          />
        )}
      </div>
    </PublicAppProvider>
  );
};