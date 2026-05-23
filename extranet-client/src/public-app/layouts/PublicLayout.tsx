import React from 'react';
import { Outlet, useParams, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '@/public-app/components/common/Navbar/Navbar';
import { BottomNav } from '@/public-app/components/common/BottomNav/BottomNav';
import { Loading } from '@/public-app/components/common/Loading/Loading';
import { Error } from '@/public-app/components/common/Error/Error';
import { useMenu } from '../hooks/useMenu';
import { PublicAppProvider } from '../contexts/PublicAppContext';
import { CartProvider, useCart } from '../contexts/CartContext';
import { ChevronLeft } from 'lucide-react';
import './PublicLayout.css';

const BottomNavWrapper: React.FC<{
  restaurantSlug: string;
  qrCode?: string;
}> = ({ restaurantSlug, qrCode }) => {
  return (
    <BottomNav
      restaurantSlug={restaurantSlug}
      qrCode={qrCode}
    />
  );
};

export const PublicLayout: React.FC = () => {
  const { restaurantSlug, qrCode } = useParams<{
    restaurantSlug: string;
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
  const { menuData, loading, error } = useMenu(restaurantSlug!, qrCode);

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
        qrCode,
      }}
    >
        <div className="public-layout">
          <Navbar restaurant={menuData.restaurant} table={menuData.table} />

          <main className="public-main">
            <Outlet />
          </main>

          <BottomNavWrapper
            restaurantSlug={restaurantSlug!}
            qrCode={qrCode}
          />
        </div>
    </PublicAppProvider>
  );
};