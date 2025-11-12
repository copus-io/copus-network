// API utility functions for handling requests with Token

export const getAuthHeaders = () => {
  const token = localStorage.getItem('copus_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

// Authenticated fetch wrapper
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const authHeaders = getAuthHeaders();

  return fetch(url, {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers,
    },
  });
};

import { APP_CONFIG } from '../config/app';

// API endpoint constants - using unified config file
export const API_ENDPOINTS = {
  BASE_URL: APP_CONFIG.API.BASE_URL,
  LOGIN: '/client/common/login',
  REGISTER: '/client/common/register',
  CHECK_EMAIL: '/client/common/checkEmailExist',
  VERIFICATION_CODE: '/client/common/getVerificationCode',
  FORGOT_PASSWORD: '/client/common/findBackPsw',
} as const;