// API Configuration - read from environment when available
// Default to the test API for backwards compatibility
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api-test.copus.network';

import * as storage from '../utils/storage';

// Generic API request function
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit & { requiresAuth?: boolean } = {}
): Promise<T> => {
  const { requiresAuth, ...fetchOptions } = options;
  const url = `${API_BASE_URL}${endpoint}`;


  const defaultHeaders: Record<string, string> = {};

  // Set JSON Content-Type only when body is not FormData
  if (!(fetchOptions.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  // Add token to headers by default if available
  // Use storage utility to check both localStorage and sessionStorage
  const token = storage.getItem('copus_token');

  if (token && token.trim() !== '') {
    // Check token format (JWT typically has 3 parts separated by dots)
    const tokenParts = token.split('.');
    if (tokenParts.length === 3) {
      // Add token to all requests when available and valid
      defaultHeaders.Authorization = `Bearer ${token}`;
    } else if (requiresAuth) {
      // Only clear invalid token and throw error if auth is required
      storage.removeItem('copus_token');
      storage.removeItem('copus_user');
      throw new Error('Invalid authentication token format, please log in again');
    }
  } else if (requiresAuth) {
    // Only throw error if auth is specifically required
    throw new Error('Valid authentication token not found, please log in again');
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      ...fetchOptions,
      headers: {
        ...defaultHeaders,
        ...fetchOptions.headers,
      },
    });


    if (!response.ok) {
      const errorText = await response.text();

      // Special handling for authentication-related errors
      if (response.status === 401 || response.status === 403) {
        // Don't automatically clear tokens here - let the calling code decide
        // This prevents temporary errors from logging users out
        if (requiresAuth) {
          // Attempt to parse error information
          let errorMessage = 'Authentication failed';
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.msg || errorJson.message || errorMessage;
          } catch (e) {
            // Ignore JSON parsing errors
          }

          throw new Error(`Authentication failed: ${errorMessage}, please log in again`);
        } else {
          // For public endpoints, log warning and error details
          console.warn(`⚠️ Public endpoint ${endpoint} returned ${response.status}`);
          console.warn('Response text:', errorText);
          // Try to parse the response anyway in case there's useful data
          try {
            const data = JSON.parse(errorText);
            console.warn('Parsed error response:', data);
            // Throw error with the actual API error message
            const errorMsg = data.msg || data.message || errorText;
            throw new Error(`API error: ${errorMsg}`);
          } catch (e) {
            // If can't parse, throw generic error
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
          }
        }
      }

      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();


    return data;
  } catch (error) {
    console.error(`❌ API request failed for ${endpoint}:`, error);

    // Check if it's a CORS error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`CORS or network error when accessing ${url}. Check if the API allows cross-origin requests.`);
    }

    throw error;
  }
};