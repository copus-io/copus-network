import { apiRequest } from './api';
import { ArticleCategoryListResponse } from '../types/category';

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
   * Get user information
   */
  static async getUserInfo(token?: string): Promise<{
    bio: string;
    coverUrl: string;
    email: string;
    faceUrl: string;
    id: number;
    namespace: string;
    username: string;
    walletAddress: string;
  }> {
    const options: any = {
      method: 'GET',
      requiresAuth: true,
    };

    // If token is provided, add it to headers
    if (token) {
      options.headers = {
        'Authorization': `Bearer ${token}`
      };
    }

    const response = await apiRequest('/client/user/userInfo', options);
    // User information is in response.data
    return response.data;
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
    // Check if user has token for personalized data
    const token = localStorage.getItem('copus_token');
    const hasValidToken = token && token.trim() !== '';

    if (hasValidToken) {
      // With token: get personalized treasury info
      return apiRequest('/client/userHome/userInfo', {
        method: 'GET',
        requiresAuth: true,
      });
    } else {
      // Without token: return default empty data
      console.log('📝 No token found, returning default treasury info');
      return {
        bio: '',
        coverUrl: '',
        email: '',
        faceUrl: '',
        id: 0,
        namespace: '',
        socialLinks: [],
        statistics: {
          articleCount: 0,
          likedArticleCount: 0,
          myArticleLikedCount: 0
        },
        username: '',
        walletAddress: ''
      };
    }
  }

  /**
   * Get user's liked articles list (paginated)
   * If no token, still fetches public data but without like status
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
  }> {
    // Check if user has token for personalized data
    const token = localStorage.getItem('copus_token');
    const hasValidToken = token && token.trim() !== '';

    if (hasValidToken) {
      // With token: get personalized data with like status
      return apiRequest(`/client/myHome/pageMyLikedArticle?pageIndex=${pageIndex}&pageSize=${pageSize}`, {
        method: 'GET',
        requiresAuth: true,
      });
    } else {
      // Without token: get public data without like status
      console.log('📝 No token found, fetching public liked articles data');
      const response = await apiRequest(`/client/myHome/pageMyLikedArticle?pageIndex=${pageIndex}&pageSize=${pageSize}`, {
        method: 'GET',
        requiresAuth: false,
      });

      // 确保没有token时所有文章的isLiked都设为false
      if (response && response.data && Array.isArray(response.data)) {
        response.data = response.data.map((article: any) => ({
          ...article,
          isLiked: false // 强制设为false，因为用户未登录无法确定真实状态
        }));
      }

      return response;
    }
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
    const response = await apiRequest(`/client/userHome/userInfo?namespace=${encodeURIComponent(namespace)}`, {
      method: 'GET',
      requiresAuth: false,
    });
    // User information is in response.data
    return response.data;
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
   * Get unread message count
   */
  static async getUnreadMessageCount(): Promise<number> {

    try {
      const response = await apiRequest('/client/user/msg/countMsg', {
        method: 'GET',
        requiresAuth: true,
      });


      // Handle different API response formats
      if (typeof response === 'number') {
        // Return number directly
        return response;
      } else if (response.data !== undefined && typeof response.data === 'number') {
        // Data wrapped in data field
        return response.data;
      } else if (response.status === 1 && response.data !== undefined) {
        // Standard response format: {status: 1, data: number, msg: "..."}
        return typeof response.data === 'number' ? response.data : 0;
      } else if (response.count !== undefined && typeof response.count === 'number') {
        // Possible field name: count
        return response.count;
      }

      // If none match, return 0
      return 0;
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
      
      return 0; // Return 0 on error, don't affect normal page display
    }
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

      // 确保没有token时所有文章的isLiked都设为false
      if (response && response.data && Array.isArray(response.data)) {
        response.data = response.data.map((article: any) => ({
          ...article,
          isLiked: false // 强制设为false，因为用户未登录无法确定真实状态
        }));
      }

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

    return apiRequest(`/client/userHome/pageMyCreatedArticle?${params.toString()}`, {
      method: 'GET',
      requiresAuth: false,
    });
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