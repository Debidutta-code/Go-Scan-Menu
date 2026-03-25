import { useState, useEffect } from 'react';
import { menuApi } from '../api/menuApi';
export const useMenu = (restaurantSlug, branchCode, qrCode) => {
    const [menuData, setMenuData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        loadMenu();
    }, [restaurantSlug, branchCode, qrCode]);
    const loadMenu = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await menuApi.getMenu(restaurantSlug, branchCode, qrCode);
            if (response.success && response.data) {
                setMenuData(response.data);
            }
        }
        catch (err) {
            setError(err.message || 'Failed to load menu');
        }
        finally {
            setLoading(false);
        }
    };
    return { menuData, loading, error, refetch: loadMenu };
};
