// src/services/qrconfig.service.ts
import env from '@/shared/config/env';
export class QRConfigService {
    static getHeaders(token) {
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        };
    }
    static async getQRConfig(token, restaurantId) {
        try {
            const response = await fetch(`${env.API_BASE_URL}/restaurants/${restaurantId._id}/qr-config`, {
                method: 'GET',
                headers: this.getHeaders(token),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch QR config');
            }
            return data;
        }
        catch (error) {
            throw error instanceof Error ? error : new Error('Network error');
        }
    }
    static async saveQRConfig(token, restaurantId, config) {
        try {
            const response = await fetch(`${env.API_BASE_URL}/restaurants/${restaurantId._id}/qr-config`, {
                method: 'POST',
                headers: this.getHeaders(token),
                body: JSON.stringify(config),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to save QR config');
            }
            return data;
        }
        catch (error) {
            throw error instanceof Error ? error : new Error('Network error');
        }
    }
    static async resetQRConfig(token, restaurantId) {
        try {
            const response = await fetch(`${env.API_BASE_URL}/restaurants/${restaurantId._id}/qr-config/reset`, {
                method: 'POST',
                headers: this.getHeaders(token),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to reset QR config');
            }
            return data;
        }
        catch (error) {
            throw error instanceof Error ? error : new Error('Network error');
        }
    }
    static async deleteQRConfig(token, restaurantId) {
        try {
            const response = await fetch(`${env.API_BASE_URL}/restaurants/${restaurantId._id}/qr-config`, {
                method: 'DELETE',
                headers: this.getHeaders(token),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete QR config');
            }
            return data;
        }
        catch (error) {
            throw error instanceof Error ? error : new Error('Network error');
        }
    }
}
