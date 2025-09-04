// frontend/src/api.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

export interface ShortenUrlRequest {
  url: string;
  validity?: number;
  shortcode?: string;
}

export interface ShortenUrlResponse {
  shortLink: string;
  expiry: string;
}

export interface UrlStatsResponse {
  originalUrl: string;
  expiry: string;
  clicks: number;
  createdAt: string;
}

export const api = {
  // POST /shorturls - Create short URL
  shortenUrl: async (data: ShortenUrlRequest): Promise<ShortenUrlResponse> => {
    const response = await axios.post(`${API_BASE_URL}/shorturls`, data);
    return response.data;
  },

  // GET /shorturls/:code - Get URL statistics
  getUrlStats: async (shortcode: string): Promise<UrlStatsResponse> => {
    const response = await axios.get(`${API_BASE_URL}/shorturls/${shortcode}`);
    return response.data;
  },

  // GET /:code - Redirect endpoint (not used directly in frontend)
  redirectUrl: (shortcode: string): string => {
    return `${API_BASE_URL}/${shortcode}`;
  }
};
