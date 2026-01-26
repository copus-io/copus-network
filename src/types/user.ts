// User types for Copus platform

/**
 * API response structure for user information
 * Based on actual API response from /client/user/userInfo
 */
export interface ApiUserInfoResponse {
  status: number;
  msg: string;
  data: {
    bio: string;
    coverUrl: string;
    email: string;
    faceUrl: string;
    id: number;
    loginType: string;
    namespace: string;
    username: string;
    walletAddress: string;
  };
}

/**
 * User information data structure
 */
export interface UserInfo {
  id: number;
  username: string;
  namespace: string;
  email: string;
  bio: string;
  faceUrl: string;
  coverUrl: string;
  walletAddress: string;
  loginType: string;
}

/**
 * Optimized user info response with caching metadata
 */
export interface CachedUserInfo extends UserInfo {
  lastFetched: number; // timestamp
  cacheExpiry: number; // cache expiration time in ms
}

/**
 * User info fetch options
 */
export interface GetUserInfoOptions {
  forceRefresh?: boolean; // bypass cache
  token?: string; // custom token
}

/**
 * User profile update request
 */
export interface UpdateUserProfileRequest {
  bio?: string;
  username?: string;
  namespace?: string;
  email?: string;
  faceUrl?: string;
  coverUrl?: string;
}

/**
 * User context data (stored in localStorage)
 */
export interface StoredUserData {
  id: number;
  username: string;
  namespace: string;
  email: string;
  faceUrl?: string;
  token: string;
  lastLogin: number;
}

/**
 * Login response structure
 */
export interface LoginResponse {
  success: boolean;
  token: string;
  user: UserInfo;
  expiresIn?: number;
}

/**
 * Registration request structure
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  namespace?: string;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Change password request
 */
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

/**
 * Wallet login request
 */
export interface WalletLoginRequest {
  address: string;
  signature: string;
  hasToken?: boolean;
}

/**
 * User validation schema
 */
export interface UserValidationErrors {
  username?: string;
  email?: string;
  bio?: string;
  namespace?: string;
}