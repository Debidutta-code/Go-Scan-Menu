import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { Navbar } from '@/public-app/components/common/Navbar/Navbar';
import { Loading } from '@/public-app/components/common/Loading/Loading';
import { Error } from '@/public-app/components/common/Error/Error';
import { usePublicInit } from '../hooks/usePublicInit';
import { PublicAppProvider } from '../contexts/PublicAppContext';
import './PublicLayout.css';
import { useCategories } from '../hooks/useCateogry';

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

    return () => {
      // Restore original styles
      document.body.style.overflow = originalStyles.overflow;
      document.body.style.height = originalStyles.height;
      document.body.style.overscrollBehavior = originalStyles.overscrollBehavior;

      document.documentElement.style.overflow = originalStyles.htmlOverflow;
      document.documentElement.style.height = originalStyles.htmlHeight;
      document.documentElement.style.overscrollBehavior = originalStyles.htmlOverscrollBehavior;
    };
  }, []);

  const location = useLocation();
  const navigate = useNavigate();
  const { data, loading, error } = usePublicInit(restaurantSlug!, qrCode);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} />;
  }

  if (!data) {
    return <Error message="Restaurant not available" />;
  }

  return (
    <PublicAppProvider
      value={{
        restaurant: data.restaurant,
        table: data.table,
        restaurantSlug: restaurantSlug!,
      }}
    >
        <div className="public-layout">
          <Navbar restaurant={data.restaurant} table={data.table || undefined} />

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
