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
  oldPsw: string;
  newPsw: string;
}

export interface DeleteAccountParams {
  accountType: number;
  code: string;
  reason: string;
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
      const token = localStorage.getItem('copus_token');

      if (token) {
        // Try with authentication (for account binding)
        const response = await apiRequest(endpoint, {
          method: 'GET',
          requiresAuth: true
        });

        if (typeof response === 'string') {
          return response;
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

      throw new Error('Did not receive a valid OAuth URL');
    } catch (error) {
      console.error('❌ Failed to get X OAuth URL:', error);
      throw new Error(`Failed to get X OAuth URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * X (Twitter) login callback handler
   */
  static async xLogin(code: string, state: string): Promise<any> {

    const endpoint = `/client/common/x/login?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;

    try {
      const response = await apiRequest(endpoint, {
        method: 'GET',
        requiresAuth: false
      });


      // Save token
      if (response.data?.token) {
        localStorage.setItem('copus_token', response.data.token);
      }

      return response;
    } catch (error) {
      console.error('❌ X Login failed:', error);
      throw new Error(`X login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      const token = localStorage.getItem('copus_token');

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
      console.error('❌ Google Login/Binding failed:', error);
      throw new Error(`Google ${hasToken ? 'account binding' : 'login'}failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    const formData = new FormData();
    formData.append('file', file);


    const response = await apiRequest('/client/common/uploadImage2S3', {
      method: 'POST',
      requiresAuth: true,
      body: formData,
    });


    // Check different possible response formats
    if (response.status === 1 && response.data) {
      // Possible response format: { status: 1, data: { url: "..." } }
      if (response.data.url) {
        return { url: response.data.url };
      }
      // Possible response format: { status: 1, data: "url" }
      if (typeof response.data === 'string' && (response.data.startsWith('http') || response.data.startsWith('https'))) {
        return { url: response.data };
      }
    }

    // Check if URL is returned directly
    if (response.url) {
      return { url: response.url };
    }

    throw new Error(response.msg || response.message || 'Image upload failed');
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
      requiresAuth: true,
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
   * Get user's liked articles list (paginated)
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

    return apiRequest(`/client/myHome/pageMyLikedArticle?pageIndex=${pageIndex}&pageSize=${pageSize}`, {
      method: 'GET',
      requiresAuth: true,
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
   * Get other user's treasury information (public data) - by namespace
   */
  static async getOtherUserTreasuryInfoByNamespace(namespace: string): Promise<{
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
    return apiRequest(`/client/userHome/userInfo?namespace=${encodeURIComponent(namespace)}`, {
      method: 'GET',
      requiresAuth: false,
    });
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
    return apiRequest(`/client/user/${userId}/info`, {
      method: 'GET',
      requiresAuth: false,
    });
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
   */
  static async changePassword(params: ChangePasswordParams): Promise<boolean> {

    try {
      const response = await apiRequest('/client/user/changePsw', {
        method: 'POST',
        body: JSON.stringify(params),
        requiresAuth: true,
      });

      return response.status === 1;
    } catch (error) {
      console.error('❌ Failed to change password:', error);
      throw error;
    }
  }

  /**
   * Update user information - Enhanced version providing more fields for the emperor ✨
   */
  static async updateUserInfo(params: {
    // Basic fields
    userName?: string;
    bio?: string;
    faceUrl?: string;
    coverUrl?: string;
    // Extended fields - More data for the emperor! 🎁
    email?: string;
    namespace?: string;
    walletAddress?: string;
    location?: string;
    website?: string;
    twitter?: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
    discord?: string;
    telegram?: string;
    birthDate?: string;
    profession?: string;
    skills?: string[];
    interests?: string[];
    language?: string;
    timezone?: string;
    country?: string;
    city?: string;
    company?: string;
    university?: string;
    phoneNumber?: string;
    [key: string]: any; // Allow more unknown fields
  }): Promise<boolean> {
    console.log('User info update parameters analysis:', {
      totalFieldsCount: Object.keys(params).length,
      fieldNamesList: Object.keys(params),
      'emperorWillBeHappy': 'because data is rich! 🎉',
      completeDataContent: params
    });

    try {
      const response = await apiRequest('/client/user/updateUser', {
        method: 'POST',
        requiresAuth: true,
        body: JSON.stringify(params),
        headers: {
          'Content-Type': 'application/json',
        }
      });

      return response.status === 1;
    } catch (error) {
      console.error('❌ Failed to update user info (emperor might need this info):', error);
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
   * Send verification code (New: for password change flow)
   */
  static async sendPasswordResetCode(email: string): Promise<boolean> {

    try {
      const response = await apiRequest(
        `/client/common/getVerificationCode?codeType=3&email=${encodeURIComponent(email)}`,
        {
          method: 'GET',
          requiresAuth: true,
        }
      );

      return response.status === 1;
    } catch (error) {
      console.error('❌ Failed to send verification code:', error);
      throw error;
    }
  }

  /**
   * Verify verification code (New: for password change flow)
   */
  static async verifyCode(email: string, code: string): Promise<boolean> {

    try {
      const response = await apiRequest('/client/common/verifyCode', {
        method: 'POST',
        requiresAuth: true,
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
}

// Verification code type constants
export const CODE_TYPES = {
  REGISTER: 1,
  LOGIN: 2,
  RESET_PASSWORD: 3,
} as const;