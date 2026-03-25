// src/services/restaurant.service.ts
import env from '@/shared/config/env';
export class RestaurantService {
    static getHeaders(token) {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };
    }
    static async getRestaurants(token, page = 1, limit = 10, filters) {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (filters) {
            params.append('filter', JSON.stringify(filters));
        }
        const response = await fetch(`${env.API_BASE_URL}/restaurants?${params}`, {
            headers: this.getHeaders(token),
        });
        return response.json();
    }
    static async getRestaurant(token, id) {
        const response = await fetch(`${env.API_BASE_URL}/restaurants/${id}`, {
            headers: this.getHeaders(token),
        });
        return response.json();
    }
    static async createRestaurant(token, data) {
        const response = await fetch(`${env.API_BASE_URL}/restaurants`, {
            method: 'POST',
            headers: this.getHeaders(token),
            body: JSON.stringify(data),
        });
        return response.json();
    }
    static async updateRestaurant(token, id, data) {
        const response = await fetch(`${env.API_BASE_URL}/restaurants/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(token),
            body: JSON.stringify(data),
        });
        return response.json();
    }
    static async deleteRestaurant(token, id) {
        const response = await fetch(`${env.API_BASE_URL}/restaurants/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(token),
        });
        return response.json();
    }
    static async updateTheme(token, id, theme) {
        const response = await fetch(`${env.API_BASE_URL}/restaurants/${id}/theme`, {
            method: 'PUT',
            headers: this.getHeaders(token),
            body: JSON.stringify(theme),
        });
        return response.json();
    }
    static async updateSubscription(token, id, subscription) {
        const response = await fetch(`${env.API_BASE_URL}/restaurants/${id}/subscription`, {
            method: 'PUT',
            headers: this.getHeaders(token),
            body: JSON.stringify(subscription),
        });
        return response.json();
    }
    static async updateSettings(token, id, settings) {
        const response = await fetch(`${env.API_BASE_URL}/restaurants/${id}/settings`, {
            method: 'PUT',
            headers: this.getHeaders(token),
            body: JSON.stringify(settings),
        });
        return response.json();
    }
}
