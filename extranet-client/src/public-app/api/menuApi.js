import env from '@/shared/config/env';
export const menuApi = {
    getMenu: async (restaurantSlug, branchCode, qrCode) => {
        try {
            const endpoint = qrCode
                ? `/public/menu/${restaurantSlug}/${branchCode}/${qrCode}`
                : `/public/menu/${restaurantSlug}/${branchCode}`;
            const response = await fetch(`${env.API_BASE_URL}${endpoint}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to load menu');
            }
            return data;
        }
        catch (error) {
            throw error;
        }
    },
};
