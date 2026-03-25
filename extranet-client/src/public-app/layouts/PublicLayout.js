import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
const CartBadgeWrapper = ({ restaurantSlug, branchCode, qrCode }) => {
    const { totalItems } = useCart();
    return (_jsx(BottomNav, { restaurantSlug: restaurantSlug, branchCode: branchCode, qrCode: qrCode, cartItemCount: totalItems }));
};
export const PublicLayout = () => {
    const { restaurantSlug, branchCode, qrCode } = useParams();
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
        const preventDefault = (e) => {
            // Find the scroller (public-main)
            const target = e.target;
            const scroller = target.closest('.public-main');
            if (!scroller) {
                // If we're not touching a scroller, prevent scrolling
                if (e.cancelable)
                    e.preventDefault();
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
    const { menuData, loading, error } = useMenu(restaurantSlug, branchCode, qrCode);
    // Check if we are inside a specific game (not the games list)
    const isInsideGame = location.pathname.includes('/games/') &&
        !location.pathname.endsWith('/games') &&
        !location.pathname.endsWith('/games/');
    if (loading) {
        return _jsx(Loading, {});
    }
    if (error) {
        return _jsx(Error, { message: error });
    }
    if (!menuData) {
        return _jsx(Error, { message: "Restaurant not available" });
    }
    const handleBack = () => {
        const basePath = qrCode
            ? `/menu/${restaurantSlug}/${branchCode}/${qrCode}`
            : `/menu/${restaurantSlug}/${branchCode}`;
        navigate(`${basePath}/games`);
    };
    return (_jsx(PublicAppProvider, { value: {
            menuData,
            restaurantSlug: restaurantSlug,
            branchCode: branchCode,
            qrCode,
        }, children: _jsx(CartProvider, { children: _jsxs("div", { className: `public-layout ${isInsideGame ? 'in-game' : ''}`, children: [!isInsideGame && _jsx(Navbar, { restaurant: menuData.restaurant, table: menuData.table }), _jsxs("main", { className: "public-main", children: [_jsx(Outlet, {}), isInsideGame && (_jsxs("button", { className: "game-back-button", onClick: handleBack, children: [_jsx(ChevronLeft, { size: 24 }), _jsx("span", { children: "Back" })] }))] }), !isInsideGame && (_jsx(CartBadgeWrapper, { restaurantSlug: restaurantSlug, branchCode: branchCode, qrCode: qrCode }))] }) }) }));
};
