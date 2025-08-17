// client/src/lib/api.js
import axios from 'axios';

// Backend API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3300/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increase timeout to 30 seconds
  withCredentials: true, // Include cookies for authentication
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Don't try to refresh tokens for login/register requests
    if (originalRequest.url?.includes('/auth/login') || 
        originalRequest.url?.includes('/auth/register')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = refreshResponse.data;
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
        }

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login only if not already on login page
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          // Don't redirect if we're already on the login or register page
          const currentPath = window.location.pathname;
          if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// API endpoints
export const endpoints = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    profile: '/users/profile',
  },
  // Products
  products: {
    list: '/products',
    byId: (id) => `/products/${id}`,
    search: '/products/search',
  },
  // Categories - Note: backend might not have this endpoint yet
  categories: {
    list: '/categories',
  },
  // Colors
  colors: {
    list: '/colors',
  },
  // Cart
  cart: {
    get: '/cart',
    addItem: '/cart/items',
    updateItem: (id) => `/cart/items/${id}`,
    removeItem: (id) => `/cart/items/${id}`,
  },
  // Orders
  orders: {
    list: '/orders',
    create: '/orders',
    byId: (id) => `/orders/${id}`,
  },
  // Addresses
  addresses: {
    list: '/addresses',
    create: '/addresses',
    update: (id) => `/addresses/${id}`,
    delete: (id) => `/addresses/${id}`,
  },
  // Payments
  payments: {
    process: '/payments/process',
    methods: '/payments/methods',
  },
  // Wishlist
  wishlist: {
    get: '/wishlist',
    addItem: '/wishlist/items',
    removeItem: (id) => `/wishlist/items/${id}`,
  },
  // Admin
  admin: {
    dashboard: '/admin/dashboard',
    users: '/admin/users',
    orders: '/admin/orders',
    analytics: '/admin/analytics',
  },
};
