// API工具函数，用于处理带Token的请求

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

// 带认证的fetch封装
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

// API端点常量 - 使用统一的配置文件
export const API_ENDPOINTS = {
  BASE_URL: APP_CONFIG.API.BASE_URL,
  LOGIN: '/client/common/login',
  REGISTER: '/client/common/register',
  CHECK_EMAIL: '/client/common/checkEmailExist',
  VERIFICATION_CODE: '/client/common/getVerificationCode',
  FORGOT_PASSWORD: '/client/common/findbackPsw',
} as const;