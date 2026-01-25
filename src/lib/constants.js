// API Configuration
// Note: /api is NOT needed - backend endpoints are at /auth/*, /oauth/*, etc.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3015';

// App Configuration
export const APP_NAME = 'VLife Wrapper';
export const APP_DESCRIPTION = 'A modern Next.js application with beautiful UI components';

// Theme Configuration
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'theme',
  USER: 'user',
  TOKEN: 'token',
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/update',
  },
};

// Route Paths
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  SETTINGS: '/settings',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFICATION: '/verification',
  VERIFY: '/verify',
  PASSWORD_RESET_SUCCESS: '/password-reset-success',
};

// UI Constants
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
};

// Animation Durations
export const ANIMATION_DURATION = {
  FAST: '150ms',
  NORMAL: '200ms',
  SLOW: '300ms',
};
