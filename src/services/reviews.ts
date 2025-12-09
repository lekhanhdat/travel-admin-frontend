import api from './api';
import type { Review, ReviewStats, PaginatedResponse, FilterOption } from '../types';

export interface ReviewsParams {
  page?: number;
  limit?: number;
  search?: string;
  locationId?: string;
  festivalId?: string;
}

export const reviewsService = {
  getAll: async (params: ReviewsParams = {}): Promise<PaginatedResponse<Review>> => {
    const response = await api.get('/reviews', { params });
    return response.data.data;
  },

  getStats: async (): Promise<ReviewStats> => {
    const response = await api.get('/reviews/stats');
    return response.data.data;
  },

  getLocationOptions: async (): Promise<FilterOption[]> => {
    const response = await api.get('/reviews/locations');
    return response.data.data;
  },

  getFestivalOptions: async (): Promise<FilterOption[]> => {
    const response = await api.get('/reviews/festivals');
    return response.data.data;
  },

  delete: async (source: string, sourceId: number, reviewIndex: number): Promise<void> => {
    await api.delete(`/reviews/${source}/${sourceId}/${reviewIndex}`);
  },
};
