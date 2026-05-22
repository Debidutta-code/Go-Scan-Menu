import axiosInstance from '@/shared/services/axios.service';

export interface FeedbackAnalytics {
  totalFeedbacks: number;
  avgFood: number;
  avgService: number;
  avgCleanliness: number;
  avgAtmosphere: number;
  avgValueForMoney: number;
  overallRating: number;
  negativeFeedbackCount: number;
  googleReviewRedirects: number;
}

export interface Feedback {
  _id: string;
  restaurantId: string;
  food: number;
  service: number;
  cleanliness: number;
  atmosphere: number;
  valueForMoney: number;
  comment?: string;
  createdAt: string;
}

export class FeedbackService {
  static getHeaders() {
    const token = localStorage.getItem('staff_token');
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  static async getAnalytics(restaurantId: string): Promise<FeedbackAnalytics> {
    const response = await axiosInstance.get(`/restaurants/${restaurantId}/feedback/analytics`, {
      headers: this.getHeaders(),
    });
    return response.data.data;
  }

  static async getFeedbacks(
    restaurantId: string,
    params: { type?: string; period?: string; page?: number; limit?: number }
  ): Promise<{ feedbacks: Feedback[]; pagination: any }> {
    const response = await axiosInstance.get(`/restaurants/${restaurantId}/feedback`, {
      params,
      headers: this.getHeaders(),
    });
    return response.data.data;
  }

  static async updateGoogleSettings(
    restaurantId: string,
    data: { googlePlaceId?: string; googleReviewEnabled?: boolean }
  ): Promise<any> {
    const response = await axiosInstance.patch(
      `/restaurants/${restaurantId}/feedback/google-settings`,
      data,
      {
        headers: this.getHeaders(),
      }
    );
    return response.data.data;
  }

  static async submitFeedback(restaurantId: string, data: any): Promise<any> {
    const response = await axiosInstance.post(`/restaurants/${restaurantId}/feedback/public`, data);
    return response.data;
  }

  static async trackGoogleRedirect(restaurantId: string): Promise<any> {
    const response = await axiosInstance.post(`/restaurants/${restaurantId}/feedback/public/track-redirect`);
    return response.data;
  }
}
