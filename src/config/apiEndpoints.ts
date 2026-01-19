/**
 * 🔍 SEARCH: api-endpoints-config
 * Centralized API endpoints configuration for easy maintenance and debugging
 */

// 🔍 SEARCH: api-endpoints-constants
export const API_ENDPOINTS = {
  // 🔍 SEARCH: space-endpoints
  SPACE: {
    CREATE: '/client/article/space/create',         // 🔍 SEARCH: space-create-endpoint
    UPDATE: '/client/article/space/update',         // 🔍 SEARCH: space-update-endpoint
    INFO: '/client/article/space/info',             // 🔍 SEARCH: space-info-endpoint
    DELETE: '/client/article/space/delete',         // 🔍 SEARCH: space-delete-endpoint
    PAGE_MY_SPACES: '/client/userHome/pageMySpaces', // 🔍 SEARCH: pageMySpaces-endpoint
  },

  // 🔍 SEARCH: article-endpoints
  ARTICLE: {
    DETAIL: '/client/article/detail',               // 🔍 SEARCH: article-detail-endpoint
    LIST: '/client/article/list',                   // 🔍 SEARCH: article-list-endpoint
    CREATE: '/client/article/create',               // 🔍 SEARCH: article-create-endpoint
    UPDATE: '/client/article/update',               // 🔍 SEARCH: article-update-endpoint
    DELETE: '/client/article/delete',               // 🔍 SEARCH: article-delete-endpoint
    LIKE: '/client/article/like',                   // 🔍 SEARCH: article-like-endpoint
    UNLIKE: '/client/article/unlike',               // 🔍 SEARCH: article-unlike-endpoint
    BIND_ARTICLES: '/client/article/bindArticles',  // 🔍 SEARCH: bind-articles-endpoint
    COLLECTED_IN: '/client/article/collectedIn',    // 🔍 SEARCH: collected-in-endpoint
    SEO_SETTINGS: '/client/article/seoSettings',    // 🔍 SEARCH: seo-settings-endpoint
  },

  // 🔍 SEARCH: user-endpoints
  USER: {
    LOGIN: '/client/user/login',                    // 🔍 SEARCH: user-login-endpoint
    REGISTER: '/client/user/register',              // 🔍 SEARCH: user-register-endpoint
    PROFILE: '/client/user/profile',                // 🔍 SEARCH: user-profile-endpoint
    UPDATE_PROFILE: '/client/user/updateProfile',   // 🔍 SEARCH: user-update-profile-endpoint
    UPDATE_NAMESPACE: '/client/user/updateUserNamespace', // 🔍 SEARCH: user-update-namespace-endpoint
    LOGOUT: '/client/user/logout',                  // 🔍 SEARCH: user-logout-endpoint
    INFO: '/client/user/info',                      // 🔍 SEARCH: user-info-endpoint
    FOLLOW: '/client/user/follow',                  // 🔍 SEARCH: user-follow-endpoint
    UNFOLLOW: '/client/user/unfollow',              // 🔍 SEARCH: user-unfollow-endpoint
  },

  // 🔍 SEARCH: category-endpoints
  CATEGORY: {
    LIST: '/client/category/list',                  // 🔍 SEARCH: category-list-endpoint
    CREATE: '/client/category/create',              // 🔍 SEARCH: category-create-endpoint
    UPDATE: '/client/category/update',              // 🔍 SEARCH: category-update-endpoint
    DELETE: '/client/category/delete',              // 🔍 SEARCH: category-delete-endpoint
  },

  // 🔍 SEARCH: comment-endpoints
  COMMENT: {
    LIST: '/client/comment/list',                   // 🔍 SEARCH: comment-list-endpoint
    CREATE: '/client/comment/create',               // 🔍 SEARCH: comment-create-endpoint
    UPDATE: '/client/comment/update',               // 🔍 SEARCH: comment-update-endpoint
    DELETE: '/client/comment/delete',               // 🔍 SEARCH: comment-delete-endpoint
    LIKE: '/client/comment/like',                   // 🔍 SEARCH: comment-like-endpoint
    UNLIKE: '/client/comment/unlike',               // 🔍 SEARCH: comment-unlike-endpoint
  },

  // 🔍 SEARCH: notification-endpoints
  NOTIFICATION: {
    LIST: '/client/notification/list',              // 🔍 SEARCH: notification-list-endpoint
    READ: '/client/notification/read',              // 🔍 SEARCH: notification-read-endpoint
    READ_ALL: '/client/notification/readAll',       // 🔍 SEARCH: notification-read-all-endpoint
    DELETE: '/client/notification/delete',          // 🔍 SEARCH: notification-delete-endpoint
  },

  // 🔍 SEARCH: upload-endpoints
  UPLOAD: {
    IMAGE: '/client/upload/image',                  // 🔍 SEARCH: upload-image-endpoint
    FILE: '/client/upload/file',                    // 🔍 SEARCH: upload-file-endpoint
  },

  // 🔍 SEARCH: auth-endpoints
  AUTH: {
    REFRESH_TOKEN: '/client/auth/refreshToken',     // 🔍 SEARCH: refresh-token-endpoint
    VERIFY_TOKEN: '/client/auth/verifyToken',       // 🔍 SEARCH: verify-token-endpoint
  },

  // 🔍 SEARCH: payment-endpoints
  PAYMENT: {
    X402_INFO: '/client/payment/x402Info',          // 🔍 SEARCH: x402-payment-info-endpoint
    UNLOCK_CONTENT: '/client/payment/unlockContent', // 🔍 SEARCH: unlock-content-endpoint
  }
} as const;

// 🔍 SEARCH: api-endpoint-types
export type ApiEndpointPath = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS][keyof typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS]];

// 🔍 SEARCH: api-endpoint-helpers
export class ApiEndpointHelper {
  // 🔍 SEARCH: build-url-helper
  static buildUrl(endpoint: string, params?: Record<string, any>): string {
    if (!params) return endpoint;

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const paramString = searchParams.toString();
    return paramString ? `${endpoint}?${paramString}` : endpoint;
  }

  // 🔍 SEARCH: get-endpoint-category
  static getEndpointCategory(endpoint: string): string | null {
    for (const [category, endpoints] of Object.entries(API_ENDPOINTS)) {
      for (const [, path] of Object.entries(endpoints)) {
        if (path === endpoint) {
          return category.toLowerCase();
        }
      }
    }
    return null;
  }
}