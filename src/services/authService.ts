import { apiRequest } from './api';
import { ArticleCategoryListResponse } from '../types/category';
import {
  UserInfo,
  GetUserInfoOptions,
  CachedUserInfo,
  ApiUserInfoResponse
} from '../types/user';
import {
  BindableSpacesRequest,
  BindableSpacesResponse
} from '../types/space';

export interface VerificationCodeParams {
  email: string;
  codeType: number; // 1: Register, 2: Login, 3: Reset password, etc.
}

export interface CheckEmailParams {
  email: string;
}

export interface ChangePasswordParams {
  email: string;
  code: string;
  newPsw: string;
}

export interface ResetPasswordParams {
  email: string;
  code: string;
  password: string;
}

export interface DeleteAccountParams {
  accountType: number;
  code: string;
  reason: string;
  // For wallet users: signature-based verification
  walletSignature?: string;
  walletMessage?: string;
  walletTimestamp?: number;
}

export interface UserHomeRequest {
  /**
   * Homepage subspace name
   */
  namespace: string;
  [property: string]: any;
}

export interface UserHomeResponse {
  bio: string;
  coverUrl: string;
  email: string;
  faceUrl: string;
  id: number;
  isEnabled: boolean;
  isOwner: boolean;
  namespace: string;
  socialLinks: Array<{
    iconUrl: string;
    linkUrl: string;
    title: string;
  }>;
  statistics: {
    articleCount: number;
    likedArticleCount: number;
    myArticleLikedCount: number;
  };
  username: string;
  walletAddress: string;
}

export class AuthService {
  /**
   * Send verification code
   */
  static async sendVerificationCode(params: VerificationCodeParams): Promise<any> {
    const { email, codeType } = params;

    return apiRequest(
      `/client/common/getVerificationCode?codeType=${codeType}&email=${encodeURIComponent(email)}`,
      {
        method: 'GET',
      }
    );
  }

  /**
   * Check if email already exists
   */
  static async checkEmailExist(params: CheckEmailParams): Promise<{ exists: boolean }> {
    const { email } = params;

    return apiRequest(
      `/client/common/checkEmailExist?email=${encodeURIComponent(email)}`,
      {
        method: 'GET',
      }
    );
  }

  /**
   * User registration
   */
  static async register(params: {
    username: string;
    email: string;
    password: string;
    verificationCode: string;
  }): Promise<any> {
    return apiRequest('/client/common/register', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * User login
   */
  static async login(params: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }): Promise<any> {
    return apiRequest('/client/common/login', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Get X OAuth authorization URL (supports both login and binding modes)
   */
  static async getXOAuthUrl(): Promise<string> {

    const endpoint = `/client/common/x/oauth`;

    try {
      // Check if user has token for account binding mode
      const token = localStorage.getItem('copus_token') || sessionStorage.getItem('copus_token');

      if (token) {
        // Try with authentication (for account binding)
        const response = await apiRequest(endpoint, {
          method: 'GET',
          requiresAuth: true
        });

        console.log('🔍 X OAuth URL API response (with auth):', response);

        if (typeof response === 'string') {
          return response;
        }
        // Check if response has URL in various possible formats
        if (response && typeof response === 'object') {
          if ('url' in response && typeof response.url === 'string') {
            return response.url;
          }
          if ('data' in response && typeof response.data === 'string') {
            return response.data;
          }
        }
      }

      // Try request without token (for third-party login)
      const response = await apiRequest(endpoint, {
        method: 'GET',
        requiresAuth: false
      });

      console.log('🔍 X OAuth URL API response (without auth):', response);

      if (typeof response === 'string') {
        return response;
      }
      // Check if response has URL in various possible formats
      if (response && typeof response === 'object') {
        if ('url' in response && typeof response.url === 'string') {
          return response.url;
        }
        if ('data' in response && typeof response.data === 'string') {
          return response.data;
        }
      }

      console.error('❌ Unexpected API response format:', response);
      throw new Error('Did not receive a valid X OAuth URL');
    } catch (error) {
      console.error('❌ Failed to get X OAuth URL:', error);
      throw new Error(`Failed to get X OAuth URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * X (Twitter) login callback handler (supports both login and binding modes)
   */
  static async xLogin(code: string, state: string, hasToken: boolean = false): Promise<any> {

    const endpoint = `/client/common/x/login?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;

    try {
      // Try request with token (for account binding)
      if (hasToken) {
        const response = await apiRequest(endpoint, {
          method: 'GET',
          requiresAuth: true
        });

        console.log('🔍 X login API response (binding mode):', response);
        console.log('🔍 Full response structure:', JSON.stringify(response, null, 2));

        // Response format can be:
        // 1. { "namespace": "string", "token": "string" }
        // 2. { "status": 1, "msg": "success", "data": { "token": "...", "namespace": "..." } }
        const token = response.data?.token || response.token;
        const namespace = response.data?.namespace || response.namespace;

        if (token) {
          localStorage.setItem('copus_token', token);
          console.log('✅ Token saved to localStorage (binding)');
        }

        return {
          token,
          namespace,
          isBinding: true
        };
      } else {
        // Try request without token (for third-party login)
        const response = await apiRequest(endpoint, {
          method: 'GET',
          requiresAuth: false
        });

        console.log('🔍 X login API response (login mode):', response);
        console.log('🔍 Full response structure:', JSON.stringify(response, null, 2));

        // Response format can be:
        // 1. { "namespace": "string", "token": "string", "username": "...", "faceUrl": "..." }
        // 2. { "status": 1, "msg": "success", "data": { "token": "...", "namespace": "...", "username": "...", "faceUrl": "..." } }
        const token = response.data?.token || response.token;
        const namespace = response.data?.namespace || response.namespace;

        // Extract X profile data from login response
        const xProfile = {
          username: response.data?.username || response.username || response.data?.name || response.name,
          faceUrl: response.data?.faceUrl || response.faceUrl || response.data?.avatar || response.avatar || response.data?.profile_image_url || response.profile_image_url,
          bio: response.data?.bio || response.bio || response.data?.description || response.description
        };

        console.log('🔑 Extracted token:', token ? token.substring(0, 20) + '...' : 'NONE');
        console.log('👤 Extracted namespace:', namespace);
        console.log('📸 Extracted X profile:', xProfile);

        if (token) {
          localStorage.setItem('copus_token', token);
          console.log('✅ Token saved to localStorage');
        } else {
          console.error('❌ No token found in response!', response);
        }

        return {
          token,
          namespace,
          isBinding: false,
          xProfile // Return X profile data
        };
      }
    } catch (error) {
      console.error('❌ X Login/Binding failed:', error);
      throw new Error(`X ${hasToken ? 'account binding' : 'login'} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get X (Twitter) profile data for syncing
   */
  static async getXProfile(): Promise<{
    username?: string;
    avatar?: string;
    name?: string;
    bio?: string;
  }> {
    const endpoint = `/client/common/x/profile`;

    try {
      const response = await apiRequest(endpoint, {
        method: 'GET',
        requiresAuth: true
      });

      console.log('🔍 X profile API response:', response);

      // Handle different response formats
      if (response.data) {
        return response.data;
      }

      return response;
    } catch (error) {
      console.error('❌ Failed to get X profile:', error);
      throw new Error(`Failed to get X profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get Facebook OAuth authorization URL (requires user login first)
   */
  static async getFacebookOAuthUrl(): Promise<string> {

    const endpoint = `/client/common/facebook/oauth`;

    try {
      const response = await apiRequest(endpoint, {
        method: 'GET',
        requiresAuth: true
      });


      // Response is a string format authorization URL
      if (typeof response === 'string') {
        return response;
      }

      throw new Error('Did not receive a valid Facebook OAuth URL');
    } catch (error) {
      console.error('❌ Failed to get Facebook OAuth URL:', error);
      throw new Error(`Failed to get Facebook OAuth URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Facebook login callback handler (supports both login and binding modes)
   */
  static async facebookLogin(code: string, state: string, hasToken: boolean = false): Promise<any> {

    const endpoint = `/client/common/facebook/login?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;

    try {
      // Try request with token (for account binding)
      if (hasToken) {
        const response = await apiRequest(endpoint, {
          method: 'GET',
          requiresAuth: true
        });


        // Response format: { "namespace": "string", "token": "string" }
        if (response.token) {
          localStorage.setItem('copus_token', response.token);
        }

        return { ...response, isBinding: true };
      } else {
        // Try request without token (for third-party login)
        const response = await apiRequest(endpoint, {
          method: 'GET',
          requiresAuth: false
        });


        // Response format: { "namespace": "string", "token": "string" }
        if (response.token) {
          localStorage.setItem('copus_token', response.token);
        }

        return { ...response, isBinding: false };
      }
    } catch (error) {
      console.error('❌ Facebook Login/Binding failed:', error);
      throw new Error(`Facebook ${hasToken ? 'account binding' : 'login'}failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get Google OAuth authorization URL (supports both login and binding modes)
   */
  static async getGoogleOAuthUrl(): Promise<string> {

    const endpoint = `/client/common/google/oauth`;

    try {
      // Check if user has token for account binding mode
      const token = localStorage.getItem('copus_token') || sessionStorage.getItem('copus_token');

      if (token) {
        // Try with authentication (for account binding)
        const response = await apiRequest(endpoint, {
          method: 'GET',
          requiresAuth: true
        });


        if (typeof response === 'string') {
          return response;
        }
        // Check if response has URL in various possible formats
        if (response && typeof response === 'object') {
          if ('url' in response && typeof response.url === 'string') {
            return response.url;
          }
          if ('data' in response && typeof response.data === 'string') {
            return response.data;
          }
        }
      }

      // Try request without token (for third-party login)
      const response = await apiRequest(endpoint, {
        method: 'GET',
        requiresAuth: false
      });


      if (typeof response === 'string') {
        return response;
      }
      // Check if response has URL in various possible formats
      if (response && typeof response === 'object') {
        if ('url' in response && typeof response.url === 'string') {
          return response.url;
        }
        if ('data' in response && typeof response.data === 'string') {
          return response.data;
        }
      }

      throw new Error('Did not receive a valid Google OAuth URL');
    } catch (error) {
      console.error('❌ Failed to get Google OAuth URL:', error);
      throw new Error(`Failed to get Google OAuth URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Google login callback handler (supports both login and binding modes)
   */
  static async googleLogin(code: string, state: string, hasToken: boolean = false): Promise<any> {

    const endpoint = `/client/common/google/login?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;

    try {
      // Try request with token (for account binding)
      if (hasToken) {
        const response = await apiRequest(endpoint, {
          method: 'GET',
          requiresAuth: true
        });

        console.log('🔍 Google login API response (binding mode):', response);

        // Response format can be:
        // 1. { "namespace": "string", "token": "string" }
        // 2. { "status": 1, "msg": "success", "data": { "token": "...", "namespace": "..." } }
        const token = response.data?.token || response.token;
        const namespace = response.data?.namespace || response.namespace;

        if (token) {
          localStorage.setItem('copus_token', token);
          console.log('✅ Token saved to localStorage (binding)');
        }

        return {
          token,
          namespace,
          isBinding: true
        };
      } else {
        // Try request without token (for third-party login)
        const response = await apiRequest(endpoint, {
          method: 'GET',
          requiresAuth: false
        });

        console.log('🔍 Google login API response (login mode):', response);
        console.log('🔍 Full response structure:', JSON.stringify(response, null, 2));

        // Response format can be:
        // 1. { "namespace": "string", "token": "string", "username": "...", "faceUrl": "..." }
        // 2. { "status": 1, "msg": "success", "data": { "token": "...", "namespace": "...", "username": "...", "faceUrl": "..." } }
        const token = response.data?.token || response.token;
        const namespace = response.data?.namespace || response.namespace;

        // Extract Google profile data from login response
        const googleProfile = {
          username: response.data?.username || response.username || response.data?.name || response.name,
          faceUrl: response.data?.faceUrl || response.faceUrl || response.data?.avatar || response.avatar || response.data?.picture || response.picture,
          email: response.data?.email || response.email
        };

        console.log('🔑 Extracted token:', token ? token.substring(0, 20) + '...' : 'NONE');
        console.log('👤 Extracted namespace:', namespace);
        console.log('📸 Extracted Google profile:', googleProfile);

        if (token) {
          localStorage.setItem('copus_token', token);
          console.log('✅ Token saved to localStorage');
        } else {
          console.error('❌ No token found in response!', response);
        }

        return {
          token,
          namespace,
          isBinding: false,
          googleProfile // Return Google profile data
        };
      }
    } catch (error) {
      console.error('❌ Google Login/Binding failed:', error);
      throw new Error(`Google ${hasToken ? 'account binding' : 'login'}failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get Google profile data for syncing
   */
  static async getGoogleProfile(): Promise<{
    username?: string;
    avatar?: string;
    name?: string;
    email?: string;
  }> {
    const endpoint = `/client/common/google/profile`;

    try {
      const response = await apiRequest(endpoint, {
        method: 'GET',
        requiresAuth: true
      });

      console.log('🔍 Google profile API response:', response);

      // Handle different response formats
      if (response.data) {
        return response.data;
      }

      return response;
    } catch (error) {
      console.error('❌ Failed to get Google profile:', error);
      throw new Error(`Failed to get Google profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get Metamask signature data
   */
  static async getMetamaskSignatureData(address: string): Promise<any> {

    const endpoint = `/client/common/getSnowflake?address=${encodeURIComponent(address)}`;

    try {
      const response = await apiRequest(endpoint, {
        method: 'GET',
        requiresAuth: false
      });

      return response;
    } catch (error) {
      console.error('❌ Get Metamask signature data failed:', error);
      throw new Error(`Failed to get signature data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Metamask login (supports both login and binding modes)
   */
  static async metamaskLogin(address: string, signature: string, hasToken: boolean = false): Promise<any> {

    const endpoint = `/client/common/metamask/login`;

    try {
      const response = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          address: address,
          signature: signature
        }),
        requiresAuth: hasToken
      });


      // Response format: { "namespace": "string", "token": "string" }
      if (response.token) {
        localStorage.setItem('copus_token', response.token);
      }

      return { ...response, isBinding: hasToken };
    } catch (error) {
      console.error('❌ Metamask Login/Binding failed:', error);
      throw new Error(`Metamask ${hasToken ? 'account binding' : 'login'}failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get OKX Wallet signature data (uses same endpoint as MetaMask)
   */
  static async okxWalletSignature(address?: string): Promise<any> {
    return this.getMetamaskSignatureData(address);
  }

  /**
   * OKX Wallet login (supports both login and binding modes)
   * Uses same endpoint as MetaMask since both are EVM-compatible wallets
   */
  static async okxWalletLogin(address: string, signature: string, hasToken: boolean = false): Promise<any> {
    // OKX Wallet is EVM-compatible, so we can use the same MetaMask login endpoint
    return this.metamaskLogin(address, signature, hasToken);
  }

  // User info cache
  private static userInfoCache = new Map<string, CachedUserInfo>();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get user information with caching and error handling
   */
  static async getUserInfo(options: GetUserInfoOptions = {}): Promise<UserInfo> {
    const { forceRefresh = false, token } = options;
    const cacheKey = token || 'default';

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = this.userInfoCache.get(cacheKey);
      if (cached && Date.now() < cached.cacheExpiry) {
        return {
          id: cached.id,
          username: cached.username,
          namespace: cached.namespace,
          email: cached.email,
          bio: cached.bio,
          faceUrl: cached.faceUrl,
          coverUrl: cached.coverUrl,
          walletAddress: cached.walletAddress,
          loginType: cached.loginType
        };
      }
    }

    try {
      const requestOptions: any = {
        method: 'GET',
        requiresAuth: true,
      };

      // If token is provided, add it to headers
      if (token) {
        requestOptions.headers = {
          'Authorization': `Bearer ${token}`
        };
      }

      const response: ApiUserInfoResponse = await apiRequest('/client/user/userInfo', requestOptions);

      // Validate API response format
      if (response.status !== 1 || !response.data) {
        throw new Error(response.msg || 'Failed to fetch user information');
      }

      // Extract and validate user data
      const userData = response.data;
      const userInfo: UserInfo = {
        id: userData.id || 0,
        username: userData.username || '',
        namespace: userData.namespace || '',
        email: userData.email || '',
        bio: userData.bio || '',
        faceUrl: userData.faceUrl || '',
        coverUrl: userData.coverUrl || '',
        walletAddress: userData.walletAddress || '',
        loginType: userData.loginType || 'email'
      };

      // Cache the result
      const cachedInfo: CachedUserInfo = {
        ...userInfo,
        lastFetched: Date.now(),
        cacheExpiry: Date.now() + this.CACHE_DURATION
      };
      this.userInfoCache.set(cacheKey, cachedInfo);

      return userInfo;
    } catch (error: any) {
      // Enhanced error handling
      const errorMessage = error?.response?.data?.msg ||
                          error?.message ||
                          'Failed to fetch user information';

      console.error('getUserInfo error:', {
        error: errorMessage,
        token: token ? '[PROVIDED]' : '[DEFAULT]',
        timestamp: new Date().toISOString()
      });

      // If it's an auth error, clear cache and let auth system handle it
      if (error?.status === 401 || error?.status === 403) {
        this.userInfoCache.delete(cacheKey);
        throw error; // Re-throw auth errors for proper handling
      }

      // For other errors, try to return cached data if available
      const cached = this.userInfoCache.get(cacheKey);
      if (cached) {
        console.warn('Using cached user info due to API error');
        return {
          id: cached.id,
          username: cached.username,
          namespace: cached.namespace,
          email: cached.email,
          bio: cached.bio,
          faceUrl: cached.faceUrl,
          coverUrl: cached.coverUrl,
          walletAddress: cached.walletAddress,
          loginType: cached.loginType
        };
      }

      // If no cache available, throw the error
      throw new Error(errorMessage);
    }
  }

  /**
   * Clear user info cache
   */
  static clearUserInfoCache(token?: string): void {
    if (token) {
      this.userInfoCache.delete(token);
    } else {
      this.userInfoCache.clear();
    }
  }

  /**
   * Preload user info (fire and forget)
   */
  static async preloadUserInfo(token?: string): Promise<void> {
    try {
      await this.getUserInfo({ token, forceRefresh: false });
    } catch (error) {
      // Silently ignore preload errors
      console.debug('User info preload failed:', error);
    }
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use getUserInfo(options) instead
   */
  static async getUserInfoLegacy(token?: string): Promise<{
    bio: string;
    coverUrl: string;
    email: string;
    faceUrl: string;
    id: number;
    namespace: string;
    username: string;
    walletAddress: string;
  }> {
    const userInfo = await this.getUserInfo({ token });
    return {
      bio: userInfo.bio,
      coverUrl: userInfo.coverUrl,
      email: userInfo.email,
      faceUrl: userInfo.faceUrl,
      id: userInfo.id,
      namespace: userInfo.namespace,
      username: userInfo.username,
      walletAddress: userInfo.walletAddress
    };
  }

  /**
   * Upload image to S3
   */
  static async uploadImage(file: File): Promise<{ url: string }> {
    console.log('🔥 AuthService.uploadImage starting upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      lastModified: file.lastModified
    });

    // Check authentication token before attempting upload
    const token = localStorage.getItem('copus_token') || sessionStorage.getItem('copus_token');
    const user = localStorage.getItem('copus_user');
    console.log('🔥 Authentication check:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'NO_TOKEN',
      hasUser: !!user,
      userPreview: user ? JSON.parse(user).username : 'NO_USER'
    });

    if (!token || token.trim() === '') {
      console.error('🔥 No authentication token found in localStorage');
      throw new Error('Please log in to upload images. Your session may have expired.');
    }

    const formData = new FormData();
    formData.append('file', file);

    console.log('🔥 FormData created, calling API...');

    try {
      const response = await apiRequest('/client/common/uploadImage2S3', {
        method: 'POST',
        requiresAuth: true,
        body: formData,
      });

      console.log('🔥 API response raw data:', {
        response,
        responseType: typeof response,
        responseKeys: Object.keys(response || {}),
        status: response?.status,
        data: response?.data,
        url: response?.url,
        msg: response?.msg,
        message: response?.message
      });

      // Check different possible response formats
      if (response.status === 1 && response.data) {
        // Possible response format: { status: 1, data: { url: "..." } }
        if (response.data.url) {
          console.log('🔥 Found URL in response.data.url:', response.data.url);
          return { url: response.data.url };
        }
        // Possible response format: { status: 1, data: "url" }
        if (typeof response.data === 'string' && (response.data.startsWith('http') || response.data.startsWith('https'))) {
          console.log('🔥 Found URL in response.data (string):', response.data);
          return { url: response.data };
        }
      }

      // Check if URL is returned directly
      if (response.url) {
        console.log('🔥 Found URL in response.url:', response.url);
        return { url: response.url };
      }

      console.error('🔥 No valid URL found in response, throwing error');
      const errorMsg = response.msg || response.message || 'Server did not return a valid image URL';
      throw new Error(errorMsg);
    } catch (error) {
      console.error('🔥 API request failed:', {
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorType: typeof error,
        errorConstructor: error?.constructor?.name
      });

      // Extract error message from different error formats
      let errorMessage = 'Image upload failed';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Handle API response error object
        const errorObj = error as any;
        if (errorObj.msg) {
          errorMessage = errorObj.msg;
        } else if (errorObj.message) {
          errorMessage = errorObj.message;
        } else if (errorObj.data?.msg) {
          errorMessage = errorObj.data.msg;
        } else if (errorObj.data?.message) {
          errorMessage = errorObj.data.message;
        }
      }

      console.error('🔥 Extracted error message:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * 批量上传评论图片
   * @param files 图片文件数组
   * @returns Promise<string[]> 图片URL数组
   */
  static async uploadCommentImages(files: File[]): Promise<string[]> {
    console.log('🔥 AuthService.uploadCommentImages starting batch upload:', {
      fileCount: files.length,
      files: files.map(file => ({
        name: file.name,
        size: (file.size / 1024).toFixed(2) + 'KB',
        type: file.type
      }))
    });

    if (files.length === 0) {
      return [];
    }

    try {
      // 并行上传所有图片
      const uploadPromises = files.map(async (file, index) => {
        console.log(`🔥 Uploading image ${index + 1}/${files.length}:`, {
          name: file.name,
          size: (file.size / 1024).toFixed(2) + 'KB'
        });

        const result = await this.uploadImage(file);

        console.log(`🔥 Image ${index + 1} uploaded successfully:`, {
          name: file.name,
          url: result.url,
          size: (file.size / 1024).toFixed(2) + 'KB'
        });

        return result.url;
      });

      const urls = await Promise.all(uploadPromises);

      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      console.log('🔥 All images uploaded successfully:', {
        count: urls.length,
        totalSize: (totalSize / 1024 / 1024).toFixed(2) + 'MB',
        urls: urls
      });

      return urls;

    } catch (error) {
      console.error('🔥 Batch image upload failed:', error);
      throw error;
    }
  }

  /**
   * Create article
   */
  static async createArticle(params: {
    categoryId: number;
    content: string;
    coverUrl: string;
    targetUrl: string;
    title: string;
    uuid: string;
  }): Promise<any> {
    return apiRequest('/client/author/article/edit', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify(params),
    });
  }

  /**
   * Delete article
   */
  static async deleteArticle(uuid: string): Promise<any> {
    return apiRequest(`/client/author/article/delete`, {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify({ uuid }),
    });
  }

  /**
   * Get article category list
   */
  static async getCategoryList(): Promise<ArticleCategoryListResponse> {
    return apiRequest('/client/author/article/categoryList', {
      method: 'GET',
      // Categories are publicly accessible but may include personalized data with token
    });
  }

  /**
   * Get article details
   */
  static async getArticleInfo(uuid: string): Promise<any> {
    const response = await apiRequest(`/client/reader/article/info?uuid=${uuid}`, {
      method: 'GET',
      requiresAuth: true,
    });

    // Add detailed debug logs for article API
    console.log('Article data details:', {
      rawData: response,
      articleData: response.data || response,
      authorFields: {
        'response.author': response.author,
        'response.data.author': response.data?.author,
        'response.user': response.user,
        'response.data.user': response.data?.user,
        'response.creator': response.creator,
        'response.data.creator': response.data?.creator
      }
    });

    return response;
  }

  /**
   * Like/Unlike article
   */
  static async likeArticle(uuid: string): Promise<any> {
    return apiRequest('/client/reader/article/like', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify({ uuid }),
    });
  }

  /**
   * Update single social media link
   */
  static async updateSocialLink(platform: string, url: string): Promise<any> {

    const socialLinkData = {
      [platform]: url
    };

    return apiRequest('/client/user/social-links', {
      method: 'PATCH',
      requiresAuth: true,
      body: JSON.stringify(socialLinkData),
    });
  }

  /**
   * Batch update social media links
   */
  static async updateAllSocialLinks(socialLinks: Record<string, string>): Promise<any> {

    return apiRequest('/client/user/social-links', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify(socialLinks),
    });
  }

  /**
   * Get user treasury information (including favorites statistics)
   * If no token, returns default/empty data
   */
  static async getUserTreasuryInfo(): Promise<{
    bio: string;
    coverUrl: string;
    email: string;
    faceUrl: string;
    id: number;
    namespace: string;
    socialLinks: Array<{
      iconUrl: string;
      linkUrl: string;
      title: string;
    }>;
    statistics: {
      articleCount: number;
      likedArticleCount: number;
      myArticleLikedCount: number;
    };
    username: string;
    walletAddress: string;
  }> {

    return apiRequest('/client/myHome/userInfo', {
      method: 'GET',
      requiresAuth: true,
    });
  }

  /**
   * Get user's liked articles list (paginated) - only if user is logged in
   */
  static async getUserLikedArticles(pageIndex: number = 1, pageSize: number = 20): Promise<{
    data: Array<{
      authorInfo: {
        faceUrl: string;
        id: number;
        namespace: string;
        username: string;
      };
      categoryInfo: {
        articleCount: number;
        color: string;
        id: number;
        name: string;
      };
      content: string;
      coverUrl: string;
      createAt: number;
      isLiked: boolean;
      likeCount: number;
      publishAt: number;
      targetUrl: string;
      title: string;
      uuid: string;
      viewCount: number;
    }>;
    pageCount: number;
    pageIndex: number;
    pageSize: number;
    totalCount: number;
  } | null> {
    // Check if user has token, if not, return null instead of throwing error
    const token = localStorage.getItem('copus_token');
    if (!token || token.trim() === '') {
      console.log('📝 No token found, skipping liked articles request');
      return null;
    }

    // With token: get personalized data with like status
    return apiRequest(`/client/myHome/pageMyLikedArticle?pageIndex=${pageIndex}&pageSize=${pageSize}`, {
      method: 'GET',
      requiresAuth: true,
    });
  }

  /**
   * Get user's unlocked (paid) articles
   */
  static async getUserUnlockedArticles(pageIndex: number = 1, pageSize: number = 20): Promise<{
    data: Array<{
      authorInfo: {
        faceUrl: string;
        id: number;
        namespace: string;
        username: string;
      };
      categoryInfo: {
        articleCount: number;
        color: string;
        id: number;
        name: string;
      };
      content: string;
      coverUrl: string;
      createAt: number;
      isLiked: boolean;
      likeCount: number;
      publishAt: number;
      targetUrl: string;
      title: string;
      uuid: string;
      viewCount: number;
    }>;
    pageCount: number;
    pageIndex: number;
    pageSize: number;
    totalCount: number;
  }> {

    // Build query parameters
    const params = new URLSearchParams();
    params.append('pageIndex', pageIndex.toString());
    params.append('pageSize', pageSize.toString());

    // Get current user ID from localStorage for targetUserId
    const userStr = localStorage.getItem('copus_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.id) {
          params.append('targetUserId', user.id.toString());
        } else {
          throw new Error('User ID not found in localStorage');
        }
      } catch (error) {
        throw new Error('Failed to parse user data from localStorage');
      }
    } else {
      throw new Error('User not logged in');
    }

    return apiRequest(`/client/userHome/pageMyUnlockedArticle?${params.toString()}`, {
      method: 'GET',
    });
  }

  /**
   * Get user social links list
   */
  static async getUserSocialLinks(): Promise<Array<{
    iconUrl: string;
    id: number;
    linkUrl: string;
    sortOrder: number;
    title: string;
    userId: number;
  }>> {

    const response = await apiRequest('/client/user/socialLink/links', {
      method: 'GET',
      requiresAuth: true,
    });


    // Handle different API response formats
    if (Array.isArray(response)) {
      // Return array directly
      return response;
    } else if (response.data && Array.isArray(response.data)) {
      // Data wrapped in data field
      return response.data;
    } else if (response.status === 1 && response.data) {
      // Standard response format: {status: 1, data: [...], msg: "..."}
      if (Array.isArray(response.data)) {
        return response.data;
      }
    }

    // If none match, return empty array
    return [];
  }

  /**
   * Get user detail info - by namespace
   * Get user home info by namespace
   * Public endpoint - does not require authentication
   */
  static async getUserHomeInfo(namespace: string): Promise<UserHomeResponse> {
    const response = await apiRequest(`/client/userHome/userInfo?namespace=${encodeURIComponent(namespace)}`, {
      method: 'GET',
      requiresAuth: false,
    });
    // User information is in response.data
    return response.data;
  }

  /**
   * Get other user's treasury information (public data) - by namespace
   * Get other user's treasury information (public data) - by namespace
   * NOTE: We explicitly exclude the Authorization header to ensure we get
   * the target user's data, not the logged-in user's data.
   */
  static async getOtherUserTreasuryInfoByNamespace(namespace: string): Promise<{
    bio: string;
    coverUrl: string;
    email: string;
    faceUrl: string;
    id: number;
    namespace: string;
    isEnabled: boolean;
    socialLinks: Array<{
      iconUrl: string;
      linkUrl: string;
      title: string;
    }>;
    statistics: {
      articleCount: number;
      likedArticleCount: number;
      myArticleLikedCount: number;
    };
    username: string;
    walletAddress: string;
  }> {
    // Make a direct fetch call without the Authorization header
    // This ensures we get the target user's data, not the logged-in user's
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api-test.copus.network';
    const url = `${API_BASE_URL}/client/userHome/userInfo?namespace=${encodeURIComponent(namespace)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // User information is in response.data
    return data.data;
  }

  /**
   * Get other user's treasury information (public data) - by userId (maintain compatibility)
   */
  static async getOtherUserTreasuryInfo(userId: number): Promise<{
    bio: string;
    coverUrl: string;
    email: string;
    faceUrl: string;
    id: number;
    namespace: string;
    socialLinks: Array<{
      iconUrl: string;
      linkUrl: string;
      title: string;
    }>;
    statistics: {
      articleCount: number;
      likedArticleCount: number;
      myArticleLikedCount: number;
    };
    username: string;
    walletAddress: string;
  }> {
    const response = await apiRequest(`/client/user/${userId}/info`, {
      method: 'GET',
      requiresAuth: false,
    });
    // User information is in response.data
    return response.data;
  }

  /**
   * Get other user's liked articles list (public data) - by namespace
   */
  static async getOtherUserLikedArticlesByNamespace(namespace: string, pageIndex: number = 1, pageSize: number = 20): Promise<{
    data: Array<{
      authorInfo: {
        faceUrl: string;
        id: number;
        namespace: string;
        username: string;
      };
      categoryInfo: {
        articleCount: number;
        color: string;
        id: number;
        name: string;
      };
      content: string;
      coverUrl: string;
      createAt: number;
      isLiked: boolean;
      likeCount: number;
      publishAt: number;
      targetUrl: string;
      title: string;
      uuid: string;
      viewCount: number;
    }>;
    pageCount: number;
    pageIndex: number;
    pageSize: number;
    totalCount: number;
  }> {
    return apiRequest(`/client/user/namespace/${namespace}/likedArticles?pageIndex=${pageIndex}&pageSize=${pageSize}`, {
      method: 'GET',
      requiresAuth: false,
    });
  }

  /**
   * Get other user's liked articles list (public data) - by userId (maintain compatibility)
   */
  static async getOtherUserLikedArticles(userId: number, pageIndex: number = 1, pageSize: number = 20): Promise<{
    data: Array<{
      authorInfo: {
        faceUrl: string;
        id: number;
        namespace: string;
        username: string;
      };
      categoryInfo: {
        articleCount: number;
        color: string;
        id: number;
        name: string;
      };
      content: string;
      coverUrl: string;
      createAt: number;
      isLiked: boolean;
      likeCount: number;
      publishAt: number;
      targetUrl: string;
      title: string;
      uuid: string;
      viewCount: number;
    }>;
    pageCount: number;
    pageIndex: number;
    pageSize: number;
    totalCount: number;
  }> {
    return apiRequest(`/client/user/${userId}/likedArticles?pageIndex=${pageIndex}&pageSize=${pageSize}`, {
      method: 'GET',
      requiresAuth: false,
    });
  }

  /**
   * Edit/Create user social link
   */
  static async editSocialLink(params: {
    iconUrl: string;
    linkUrl: string;
    sortOrder: number;
    title: string;
  }): Promise<{
    iconUrl: string;
    id: number;
    linkUrl: string;
    sortOrder: number;
    title: string;
    userId: number;
  }> {

    const response = await apiRequest('/client/user/socialLink/edit', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify(params),
    });


    // Handle different API response formats
    if (response.iconUrl && response.id) {
      // Return object directly (ideal case)
      return response;
    } else if (response.data && response.data.iconUrl && response.data.id) {
      // Data wrapped in data field (ideal case)
      return response.data;
    } else if (response.status === 1 && response.data) {
      // Standard response format: {status: 1, data: {...}, msg: "..."}
      return response.data;
    } else if (response.iconUrl || response.linkUrl || response.title) {
      // Direct response format, but may be missing ID (actual case)
      return response;
    }

    // If none match, throw error
    throw new Error(response.msg || response.message || 'Failed to edit social link');
  }

  /**
   * Delete user social link
   */
  static async deleteSocialLink(id: number): Promise<boolean> {

    const response = await apiRequest('/client/user/socialLink/delete', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify({ id }),
    });


    // Handle different API response formats
    if (response === true || response === false) {
      // Return boolean directly
      return response;
    } else if (response.data === true || response.data === false) {
      // Data wrapped in data field
      return response.data;
    } else if (response.status === 1 && response.data !== undefined) {
      // Standard response format: {status: 1, data: true, msg: "..."}
      return response.data === true;
    }

    // If none match, determine by status
    return response.status === 1 || response.success === true;
  }

  /**
   * Update user namespace
   */
  static async updateUserNamespace(namespace: string): Promise<boolean> {

    try {
      const response = await apiRequest('/client/user/updateUserNamespace', {
        method: 'POST',
        requiresAuth: true,
        body: JSON.stringify({
          value: namespace
        }),
        headers: {
          'Content-Type': 'application/json',
        }
      });


      // API returns boolean true
      return response === true || response;
    } catch (error) {
      console.error('❌ Failed to update namespace:', error);
      throw error;
    }
  }

  /**
   * Change password
   * Requires both valid auth token and email verification code for security
   */
  static async changePassword(params: ChangePasswordParams): Promise<boolean> {

    try {
      const response = await apiRequest('/client/user/changePsw', {
        method: 'POST',
        body: JSON.stringify(params),
        requiresAuth: true, // Requires valid auth token + verification code for security
      });

      return response.status === 1;
    } catch (error) {
      console.error('❌ Failed to change password:', error);
      throw error;
    }
  }

  /**
   * Reset password (forgot password flow)
   * Public endpoint - does not require authentication
   * Uses verification code sent to email for authentication
   */
  static async resetPassword(params: ResetPasswordParams): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiRequest('/client/common/findBackPsw', {
        method: 'POST',
        body: JSON.stringify(params),
        requiresAuth: false, // Public endpoint - authenticates using verification code
      });

      console.log('Reset password API response:', response);

      if (response.status === 1) {
        return { success: true };
      } else {
        // Return API error message
        return { success: false, message: response.msg || 'Reset password failed' };
      }
    } catch (error) {
      console.error('❌ Failed to reset password:', error);
      throw error;
    }
  }

  /**
   * Update user information
   * API only accepts: bio, coverUrl, faceUrl, userName
   */
  static async updateUserInfo(params: {
    userName?: string;
    bio?: string;
    faceUrl?: string;
    coverUrl?: string;
    [key: string]: any; // Allow other fields for backward compatibility, but they won't be sent to API
  }): Promise<boolean> {
    // Filter to only send the 4 fields that the API accepts
    const allowedFields = {
      ...(params.bio !== undefined && { bio: params.bio }),
      ...(params.coverUrl !== undefined && { coverUrl: params.coverUrl }),
      ...(params.faceUrl !== undefined && { faceUrl: params.faceUrl }),
      ...(params.userName !== undefined && { userName: params.userName }),
    };

    try {
      const response = await apiRequest('/client/user/updateUser', {
        method: 'POST',
        requiresAuth: true,
        body: JSON.stringify(allowedFields),
        headers: {
          'Content-Type': 'application/json',
        }
      });

      return response.status === 1;
    } catch (error) {
      console.error('❌ Failed to update user info:', error);
      throw error;
    }
  }

  /**
   * User logout
   */
  static async logout(): Promise<any> {

    return apiRequest('/client/user/logout', {
      method: 'POST',
      requiresAuth: true,
    });
  }

  /**
   * Delete user account
   */
  static async deleteAccount(params: DeleteAccountParams): Promise<boolean> {

    try {
      const response = await apiRequest('/client/user/deleteUser', {
        method: 'POST',
        requiresAuth: true,
        body: JSON.stringify(params),
      });

      return response.status === 1;
    } catch (error) {
      console.error('❌ Failed to delete account:', error);
      throw error;
    }
  }

  /**
   * Verify verification code (New: for password change flow)
   * Public endpoint - does not require authentication
   */
  static async verifyCode(email: string, code: string): Promise<boolean> {

    try {
      const response = await apiRequest('/client/common/verifyCode', {
        method: 'POST',
        requiresAuth: false,
        body: JSON.stringify({
          email,
          code,
          codeType: 3, // Password change type
        }),
      });

      return response.status === 1;
    } catch (error) {
      console.error('❌ Verification code validation failed:', error);
      throw error;
    }
  }

  /**
   * Update password (New: directly update password after verification passes)
   */
  static async updatePassword(newPassword: string): Promise<boolean> {

    try {
      const response = await apiRequest('/client/user/updatePassword', {
        method: 'POST',
        requiresAuth: true,
        body: JSON.stringify({
          newPassword,
        }),
      });

      return response.status === 1;
    } catch (error) {
      console.error('❌ Failed to update password:', error);
      throw error;
    }
  }

  /**
   * Get detailed unread message counts from API
   */
  static async getUnreadMessageCounts(): Promise<{
    commentCount: number;
    earningCount: number;
    totalCount: number;
    treasureCount: number;
  }> {

    try {
      // Note: requiresAuth is true so that 403 errors will clear the stale token and log out the user
      // The NotificationContext already checks for token presence before calling this
      const response = await apiRequest('/client/user/msg/countMsg', {
        method: 'GET',
        requiresAuth: true,
      });

      // Handle new detailed response format
      if (response && typeof response === 'object') {
        // New format: { commentCount, earningCount, totalCount, treasureCount }
        if ('commentCount' in response && 'earningCount' in response &&
            'totalCount' in response && 'treasureCount' in response) {
          return {
            commentCount: response.commentCount || 0,
            earningCount: response.earningCount || 0,
            totalCount: response.totalCount || 0,
            treasureCount: response.treasureCount || 0,
          };
        }

        // Handle wrapped response format
        if (response.data && typeof response.data === 'object' && 'commentCount' in response.data) {
          const data = response.data;
          return {
            commentCount: data.commentCount || 0,
            earningCount: data.earningCount || 0,
            totalCount: data.totalCount || 0,
            treasureCount: data.treasureCount || 0,
          };
        }

        // Legacy format handling: single number
        if (typeof response === 'number') {
          return {
            commentCount: 0,
            earningCount: 0,
            totalCount: response,
            treasureCount: 0,
          };
        } else if (response.data !== undefined && typeof response.data === 'number') {
          return {
            commentCount: 0,
            earningCount: 0,
            totalCount: response.data,
            treasureCount: 0,
          };
        }
      }

      // Default empty counts
      return {
        commentCount: 0,
        earningCount: 0,
        totalCount: 0,
        treasureCount: 0,
      };
    } catch (error) {
      console.error('❌ Failed to get unread message count:', error);
      
      // Special handling for authentication errors (401/403)
      // When these occur, we need to trigger a logout
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('401') || errorMessage.includes('403') || 
            errorMessage.includes('authentication failed') || errorMessage.includes('authorization failed')) {
          // We'll handle this in the API layer
          throw error;
        }
      }
      
      return {
        commentCount: 0,
        earningCount: 0,
        totalCount: 0,
        treasureCount: 0,
      }; // Return empty counts on error, don't affect normal page display
    }
  }

  /**
   * Get total unread message count (backward compatibility)
   */
  static async getUnreadMessageCount(): Promise<number> {
    const counts = await this.getUnreadMessageCounts();
    return counts.totalCount;
  }

  /**
   * Get message notification settings list
   */
  static async getMessageNotificationSettings(): Promise<Array<{ isOpen: boolean; msgType: number }>> {
    try {
      const response = await apiRequest('/client/user/msg/console/page', {
        method: 'GET',
        requiresAuth: true
      });


      // If response is directly an array
      if (Array.isArray(response)) {
        return response;
      }

      // If response has data field and is array
      if (response && Array.isArray(response.data)) {
        return response.data;
      }

      return [];
    } catch (error) {
      console.error('❌ Failed to get message notification settings:', error);
      return [];
    }
  }

  /**
   * Update message notification setting
   */
  static async updateMessageNotificationSetting(msgType: number, isOpen: boolean): Promise<boolean> {
    try {
      const response = await apiRequest('/client/user/msg/console/changeState', {
        method: 'POST',
        requiresAuth: true,
        body: JSON.stringify({
          msgType,
          isOpen
        })
      });


      // Based on the provided information, API returns true directly to indicate success
      return response === true ||
             (response && response.data === true) ||
             (response && response.success === true);
    } catch (error) {
      console.error('❌ Failed to update message notification setting:', error);
      return false;
    }
  }

  /**
   * Get user's liked articles list - using correct API path
   * Public endpoint - does not require authentication when viewing other users
   */
  static async getMyLikedArticlesCorrect(pageIndex: number = 1, pageSize: number = 10, targetUserId?: number): Promise<{
    data: Array<{
      authorInfo: {
        faceUrl: string;
        id: number;
        namespace: string;
        username: string;
      };
      categoryInfo: {
        articleCount: number;
        color: string;
        id: number;
        name: string;
      };
      content: string;
      coverUrl: string;
      createAt: number;
      isLiked: boolean;
      likeCount: number;
      publishAt: number;
      targetUrl: string;
      title: string;
      uuid: string;
      viewCount: number;
    }>;
    pageCount: number;
    pageIndex: number;
    pageSize: number;
    totalCount: number;
  }> {
    // Check if user has token for personalized data
    const token = localStorage.getItem('copus_token');
    const hasValidToken = token && token.trim() !== '';

    const params = new URLSearchParams();
    params.append('pageIndex', pageIndex.toString());
    params.append('pageSize', pageSize.toString());
    if (targetUserId !== undefined) {
      params.append('targetUserId', targetUserId.toString());
    }

    if (hasValidToken) {
      // With token: get personalized data with like status
      console.log('📝 Fetching liked articles with authentication for personalized data');
      return apiRequest(`/client/userHome/pageMyLikedArticle?${params.toString()}`, {
        method: 'GET',
        requiresAuth: true,
      });
    } else {
      // Without token: get public data without like status
      console.log('📝 No token found, fetching public liked articles data');
      const response = await apiRequest(`/client/userHome/pageMyLikedArticle?${params.toString()}`, {
        method: 'GET',
        requiresAuth: false,
      });


      return response;
    }
  }

  /**
   * Get user's created articles list - using correct API path
   */
  /**
   * Get user's created articles list
   * Public endpoint - does not require authentication
   */
  static async getMyCreatedArticles(pageIndex: number = 1, pageSize: number = 10, targetUserId?: number): Promise<{
    data: Array<{
      authorInfo: {
        faceUrl: string;
        id: number;
        namespace: string;
        username: string;
      };
      categoryInfo: {
        articleCount: number;
        color: string;
        id: number;
        name: string;
      };
      content: string;
      coverUrl: string;
      createAt: number;
      isLiked: boolean;
      likeCount: number;
      publishAt: number;
      targetUrl: string;
      title: string;
      uuid: string;
      viewCount: number;
    }>;
    pageCount: number;
    pageIndex: number;
    pageSize: number;
    totalCount: number;
  }> {
    const params = new URLSearchParams();
    params.append('pageIndex', pageIndex.toString());
    params.append('pageSize', pageSize.toString());
    if (targetUserId !== undefined) {
      params.append('targetUserId', targetUserId.toString());
    }

    // Check if user has token for authenticated request
    const token = localStorage.getItem('copus_token');
    if (token) {
      return apiRequest(`/client/userHome/pageMyCreatedArticle?${params.toString()}`, {
        method: 'GET',
        requiresAuth: true,
      });
    } else {
      return apiRequest(`/client/userHome/pageMyCreatedArticle?${params.toString()}`, {
        method: 'GET',
        requiresAuth: false,
      });
    }
  }

  /**
   * Get user's spaces (treasuries) using pageMySpaces API
   * @param targetUserId - Required target user ID
   * @param pageIndex - Optional page number (default: 1)
   * @param pageSize - Optional page size (default: 20)
   */
  static async getMySpaces(targetUserId: number, pageIndex: number = 1, pageSize: number = 20): Promise<any> {
    const params = new URLSearchParams({
      targetUserId: targetUserId.toString(),
      pageIndex: pageIndex.toString(),
      pageSize: pageSize.toString(),
    });
    return apiRequest(`/client/userHome/pageMySpaces?${params.toString()}`, {
      method: 'GET',
    });
  }

  /**
   * Get space info by namespace
   * @param namespace - Space namespace identifier
   */
  static async getSpaceInfo(namespace: string): Promise<any> {
    return apiRequest(`/client/article/space/info/${namespace}`, {
      method: 'GET',
    });
  }

  /**
   * Get space articles by spaceId (paginated)
   * @param spaceId - Required space ID
   * @param pageIndex - Optional page number (default: 1)
   * @param pageSize - Optional page size (default: 20)
   */
  static async getSpaceArticles(spaceId: number, pageIndex: number = 1, pageSize: number = 20): Promise<any> {
    const params = new URLSearchParams({
      spaceId: spaceId.toString(),
      pageIndex: pageIndex.toString(),
      pageSize: pageSize.toString(),
    });
    return apiRequest(`/client/article/space/pageArticles?${params.toString()}`, {
      method: 'GET',
    });
  }

  /**
   * Get spaces that contain a specific article
   * @param articleId - The article ID (from article.id field)
   */
  static async getSpacesByArticleId(articleId: number): Promise<any> {
    return apiRequest(`/client/article/bind/spacesByArticleId/${articleId}`, {
      method: 'GET',
    });
  }

  /**
   * Get user's bindable spaces for collecting an article
   * Returns spaces with isBind flag indicating if article is already bound
   * @param articleId - Optional article ID to check binding status for each space
   * @returns Array of bindable spaces with enhanced data structure
   */
  static async getBindableSpaces(articleId?: number): Promise<BindableSpacesResponse> {
    // Build query parameters
    let url = '/client/article/bind/bindableSpaces';
    if (articleId) {
      url += `?id=${articleId}`;
    }

    return apiRequest(url, {
      method: 'GET',
    });
  }

  /**
   * Create a new space/treasury
   * @param name - The name of the new space
   * @param description - Optional description for the space
   * @param coverUrl - Optional cover image URL for the space
   * @param faceUrl - Optional avatar/face image URL for the space
   * @returns The created space object with id, name, namespace, spaceType, userId, etc.
   */
  static async createSpace(name: string, description?: string, coverUrl?: string, faceUrl?: string, visibility?: number): Promise<any> {
    return apiRequest(`/client/article/space/create`, {
      method: 'POST',
      body: JSON.stringify({
        name,
        ...(description && { description }),
        ...(coverUrl && { coverUrl }),
        ...(faceUrl && { faceUrl }),
        ...(visibility !== undefined && { visibility })
      }),
    });
  }

  /**
   * Update a space/treasury
   * API: POST /client/article/space/update
   * @param id - The space ID
   * @param name - The new name for the space
   * @param description - Optional new description for the space
   * @param coverUrl - Optional new cover image URL for the space
   * @param faceUrl - Optional new avatar/face image URL for the space
   */
  static async updateSpace(id: number, name: string, description?: string, coverUrl?: string, faceUrl?: string, isPrivate?: boolean, visibility?: number): Promise<any> {
    return apiRequest(`/client/article/space/update`, {
      method: 'POST',
      body: JSON.stringify({
        id,
        name,
        ...(description !== undefined && { description }),
        ...(coverUrl !== undefined && { coverUrl }),
        ...(faceUrl !== undefined && { faceUrl }),
        // Send both new visibility and legacy isPrivate for backward compatibility
        ...(visibility !== undefined && { visibility }),
        ...(isPrivate !== undefined && { isPrivate })
      }),
    });
  }

  /**
   * Delete a space/treasury
   * API: POST /client/article/space/delete
   * @param id - The space ID to delete
   */
  static async deleteSpace(id: number): Promise<any> {
    return apiRequest(`/client/article/space/delete`, {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  }

  /**
   * Bind an article to one or more spaces/treasuries
   * @param articleId - The article ID (numeric ID from article.id field)
   * @param spaceIds - Array of space IDs to bind the article to
   */
  static async bindArticles(articleId: number, spaceIds: number[]): Promise<any> {
    return apiRequest(`/client/article/bind/bindArticles`, {
      method: 'POST',
      body: JSON.stringify({ articleId, spaceIds }),
    });
  }

  /**
   * Follow a space/treasury
   * API: POST /client/article/space/follow
   * @param id - The space ID to follow
   */
  static async followSpace(id: number): Promise<any> {
    return apiRequest(`/client/article/space/follow`, {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  }

  /**
   * Get list of followed spaces
   * API: GET /client/article/space/myFollowedSpaces
   */
  static async getFollowedSpaces(): Promise<any> {
    return apiRequest(`/client/article/space/myFollowedSpaces`, {
      method: 'GET',
      requiresAuth: true,
    });
  }

  /**
   * Get articles from followed spaces (paginated)
   * API: GET /client/article/space/pageMyFollowedArticle
   * @param pageIndex - Page number (default 1)
   * @param pageSize - Page size (default 20)
   */
  static async getFollowedArticles(pageIndex: number = 1, pageSize: number = 20): Promise<any> {
    return apiRequest(`/client/article/space/pageMyFollowedArticle?pageIndex=${pageIndex}&pageSize=${pageSize}`, {
      method: 'GET',
      requiresAuth: true,
    });
  }

  /**
   * Batch import articles to a space
   * API: POST /client/article/space/importArticles
   * @param spaceId - The space ID to import articles to
   * @param articles - Array of articles to import
   */
  static async importArticles(spaceId: number, articles: Array<{
    title: string;
    content: string;
    targetUrl: string;
    coverUrl?: string;
  }>): Promise<any> {
    // According to API docs, the request body should be an object with spaceId and articles
    const requestBody = {
      spaceId,
      articles: articles.map(article => ({
        title: article.title,
        content: article.content,
        targetUrl: article.targetUrl,
        coverUrl: article.coverUrl || ''
      }))
    };

    console.log('📤 Import API request body:', JSON.stringify(requestBody, null, 2));

    const response = await apiRequest(`/client/article/space/importArticles`, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    console.log('📥 Import API raw response:', response);
    return response;
  }

  /**
   * Fetch URL metadata including og:image for auto-fill cover image
   * This calls a backend endpoint that handles CORS-protected external URLs
   * @param url The URL to fetch metadata from
   * @returns Promise with og:image URL and other metadata
   */
  static async fetchUrlMetadata(url: string): Promise<{
    ogImage?: string;
    title?: string;
    description?: string;
    favicon?: string;
  }> {
    try {
      console.log('🔍 Fetching URL metadata for:', url);

      const response = await apiRequest(`/client/common/getUrlMetadata?targetUrl=${encodeURIComponent(url)}`, {
        method: 'GET',
        requiresAuth: false,
      });

      console.log('🔍 URL metadata response:', response);

      // Handle different response formats
      if (response?.data) {
        return {
          ogImage: response.data.ogImage || response.data.image || response.data.coverUrl,
          title: response.data.title || response.data.ogTitle,
          description: response.data.description || response.data.ogDescription,
          favicon: response.data.favicon || response.data.icon,
        };
      }

      if (response?.ogImage || response?.image) {
        return {
          ogImage: response.ogImage || response.image,
          title: response.title,
          description: response.description,
          favicon: response.favicon,
        };
      }

      return {};
    } catch (error) {
      // Fail gracefully - this is an optional enhancement
      console.log('🔍 URL metadata fetch failed (this is optional):', error);
      return {};
    }
  }

}

// Verification code type constants
export const CODE_TYPES = {
  REGISTER: 0,
  FindBackEmailPsw: 1,
  UpdateEmail: 2,
  RESET_PASSWORD: 3,
  DELETE_ACCOUNT: 99,
} as const;