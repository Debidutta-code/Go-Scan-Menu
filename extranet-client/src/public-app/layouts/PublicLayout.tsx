import React from 'react';
import { Outlet, useParams, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar/Navbar';
import { BottomNav } from '../components/common/BottomNav/BottomNav';
import { Loading } from '../components/common/Loading/Loading';
import { Error } from '../components/common/Error/Error';
import { useMenu } from '../hooks/useMenu';
import { PublicAppProvider } from '../contexts/PublicAppContext';
import { CartProvider, useCart } from '../contexts/CartContext';
import { ChevronLeft } from 'lucide-react';
import './PublicLayout.css';

const CartBadgeWrapper: React.FC<{
  restaurantSlug: string;
  branchCode: string;
  qrCode?: string;
}> = ({ restaurantSlug, branchCode, qrCode }) => {
  const { totalItems } = useCart();
  return (
    <BottomNav
      restaurantSlug={restaurantSlug}
      branchCode={branchCode}
      qrCode={qrCode}
      cartItemCount={totalItems}
    />
  );
};

export const PublicLayout: React.FC = () => {
  const { restaurantSlug, branchCode, qrCode } = useParams<{
    restaurantSlug: string;
    branchCode: string;
    qrCode?: string;
  }>();

  React.useEffect(() => {
    // Lock body and html scrolling
    const originalStyles = {
      overflow: document.body.style.overflow,
      height: document.body.style.height,
      overscrollBehavior: document.body.style.overscrollBehavior,
      htmlOverflow: document.documentElement.style.overflow,
      htmlHeight: document.documentElement.style.height,
      htmlOverscrollBehavior: document.documentElement.style.overscrollBehavior,
    };

    document.body.style.overflow = 'hidden';
    document.body.style.height = '100dvh';
    document.body.style.overscrollBehavior = 'none';

    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100dvh';
    document.documentElement.style.overscrollBehavior = 'none';

    // Prevent default touchmove behavior globally to stop "bounce" effect
    const preventDefault = (e: TouchEvent) => {
      // Find the scroller (public-main)
      const target = e.target as HTMLElement;
      const scroller = target.closest('.public-main');

      if (!scroller) {
        // If we're not touching a scroller, prevent scrolling
        if (e.cancelable) e.preventDefault();
        return;
      }

      // If we are in a scroller, we only want to prevent if we're at the edges
      // and trying to scroll further (which causes the bounce)
      const { scrollTop, scrollHeight, clientHeight } = scroller;
      const isAtTop = scrollTop <= 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight;

      // This is a bit simplified, but blocks the bounce effectively
      // if (isAtTop || isAtBottom) {
      //   if (e.cancelable) e.preventDefault();
      // }
    };

    // Use passive: false to allow preventDefault
    window.addEventListener('touchmove', preventDefault, { passive: false });

    return () => {
      // Restore original styles
      document.body.style.overflow = originalStyles.overflow;
      document.body.style.height = originalStyles.height;
      document.body.style.overscrollBehavior = originalStyles.overscrollBehavior;

      document.documentElement.style.overflow = originalStyles.htmlOverflow;
      document.documentElement.style.height = originalStyles.htmlHeight;
      document.documentElement.style.overscrollBehavior = originalStyles.htmlOverscrollBehavior;

      window.removeEventListener('touchmove', preventDefault);
    };
  }, []);

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
      <CartProvider>
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
            <CartBadgeWrapper
              restaurantSlug={restaurantSlug!}
              branchCode={branchCode!}
              qrCode={qrCode}
            />
          )}
        </div>
      </CartProvider>
    </PublicAppProvider>
  );
};