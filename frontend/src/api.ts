// frontend/src/api.ts
import axios from 'axios';
import { logInfo, logError, logWarn } from './loggerClient';

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

// Configure axios interceptors for logging
axios.interceptors.request.use(
  async (config) => {
    await logInfo('api', 'Making HTTP request', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL
    });
    return config;
  },
  async (error) => {
    await logError('api', 'Request interceptor error', { error: error.message });
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  async (response) => {
    await logInfo('api', 'HTTP request successful', {
      status: response.status,
      url: response.config.url,
      method: response.config.method?.toUpperCase()
    });
    return response;
  },
  async (error) => {
    const errorDetails = {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      message: error.message
    };
    
    if (error.response?.status >= 500) {
      await logError('api', 'Server error in HTTP request', errorDetails);
    } else if (error.response?.status >= 400) {
      await logWarn('api', 'Client error in HTTP request', errorDetails);
    } else {
      await logError('api', 'Network error in HTTP request', errorDetails);
    }
    
    return Promise.reject(error);
  }
);

export const api = {
  // POST /shorturls - Create short URL
  shortenUrl: async (data: ShortenUrlRequest): Promise<ShortenUrlResponse> => {
    await logInfo('api', 'Starting URL shortening request', {
      originalUrl: data.url,
      hasCustomShortcode: !!data.shortcode,
      validity: data.validity
    });

    try {
      const response = await axios.post(`${API_BASE_URL}/shorturls`, data);
      
      await logInfo('api', 'URL shortening completed successfully', {
        shortLink: response.data.shortLink,
        expiry: response.data.expiry
      });
      
      return response.data;
    } catch (error: any) {
      await logError('api', 'URL shortening failed', {
        error: error.message,
        originalUrl: data.url,
        status: error.response?.status
      });
      throw error;
    }
  },

  // GET /shorturls/:code - Get URL statistics
  getUrlStats: async (shortcode: string): Promise<UrlStatsResponse> => {
    await logInfo('api', 'Fetching URL statistics', { shortcode });

    try {
      const response = await axios.get(`${API_BASE_URL}/shorturls/${shortcode}`);
      
      await logInfo('api', 'URL statistics retrieved successfully', {
        shortcode,
        clicks: response.data.clicks,
        originalUrl: response.data.originalUrl
      });
      
      return response.data;
    } catch (error: any) {
      await logError('api', 'Failed to fetch URL statistics', {
        error: error.message,
        shortcode,
        status: error.response?.status
      });
      throw error;
    }
  },

  // GET /:code - Redirect endpoint (not used directly in frontend)
  redirectUrl: (shortcode: string): string => {
    logInfo('api', 'Generating redirect URL', { shortcode });
    return `${API_BASE_URL}/${shortcode}`;
  }
};
