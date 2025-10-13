import { apiRequest } from './api';
import { ArticleCategoryListResponse } from '../types/category';

export interface VerificationCodeParams {
  email: string;
  codeType: number; // 1: 注册, 2: 登录, 3: 重置密码等
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
   * 发送验证码
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
   * 检查邮箱是否已存在
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
   * 用户注册
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
   * 用户登录
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
   * 获取X OAuth授权URL（需要用户先登录）
   */
  static async getXOAuthUrl(): Promise<string> {

    const endpoint = `/client/common/x/oauth`;

    try {
      const response = await apiRequest(endpoint, {
        method: 'GET',
        requiresAuth: true
      });

      console.log('✅ X OAuth URL response:', response);

      // 响应是字符串格式的授权URL
      if (typeof response === 'string') {
        console.log('🔗 X OAuth URL:', response);
        return response;
      }

      throw new Error('未收到有效的OAuth URL');
    } catch (error) {
      console.error('❌ 获取X OAuth URL失败:', error);
      throw new Error(`获取X OAuth URL失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * X (Twitter) 登录回调处理
   */
  static async xLogin(code: string, state: string): Promise<any> {
    console.log('🐦 X Login with code:', code, 'state:', state);

    const endpoint = `/client/common/x/login?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;

    try {
      const response = await apiRequest(endpoint, {
        method: 'GET',
        requiresAuth: false
      });

      console.log('✅ X Login response:', response);

      // 保存token
      if (response.data?.token) {
        localStorage.setItem('copus_token', response.data.token);
        console.log('🔑 Token saved to localStorage');
      }

      return response;
    } catch (error) {
      console.error('❌ X Login failed:', error);
      throw new Error(`X 登录失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 获取Facebook OAuth授权URL（需要用户先登录）
   */
  static async getFacebookOAuthUrl(): Promise<string> {
    console.log('🔗 获取Facebook OAuth授权URL');

    const endpoint = `/client/common/facebook/oauth`;

    try {
      const response = await apiRequest(endpoint, {
        method: 'GET',
        requiresAuth: true
      });

      console.log('✅ Facebook OAuth URL response:', response);

      // 响应是字符串格式的授权URL
      if (typeof response === 'string') {
        console.log('🔗 Facebook OAuth URL:', response);
        return response;
      }

      throw new Error('未收到有效的Facebook OAuth URL');
    } catch (error) {
      console.error('❌ 获取Facebook OAuth URL失败:', error);
      throw new Error(`获取Facebook OAuth URL失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Facebook 登录回调处理（支持登录和绑定两种模式）
   */
  static async facebookLogin(code: string, state: string, hasToken: boolean = false): Promise<any> {
    console.log('📘 Facebook Login with code:', code, 'state:', state, 'hasToken:', hasToken);

    const endpoint = `/client/common/facebook/login?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;

    try {
      // 尝试带token的请求（用于账号绑定）
      if (hasToken) {
        const response = await apiRequest(endpoint, {
          method: 'GET',
          requiresAuth: true
        });

        console.log('✅ Facebook Account Binding response:', response);

        // 响应格式: { "namespace": "string", "token": "string" }
        if (response.token) {
          localStorage.setItem('copus_token', response.token);
          console.log('🔑 New token saved to localStorage');
        }

        return { ...response, isBinding: true };
      } else {
        // 尝试不带token的请求（用于第三方登录）
        const response = await apiRequest(endpoint, {
          method: 'GET',
          requiresAuth: false
        });

        console.log('✅ Facebook Login response:', response);

        // 响应格式: { "namespace": "string", "token": "string" }
        if (response.token) {
          localStorage.setItem('copus_token', response.token);
          console.log('🔑 Token saved to localStorage');
        }

        return { ...response, isBinding: false };
      }
    } catch (error) {
      console.error('❌ Facebook Login/Binding failed:', error);
      throw new Error(`Facebook ${hasToken ? '账号绑定' : '登录'}失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 获取Google OAuth授权URL（需要用户先登录）
   */
  static async getGoogleOAuthUrl(): Promise<string> {
    console.log('🔗 获取Google OAuth授权URL');

    const endpoint = `/client/common/google/oauth`;

    try {
      const response = await apiRequest(endpoint, {
        method: 'GET',
        requiresAuth: true
      });

      console.log('✅ Google OAuth URL response:', response);

      // 响应是字符串格式的授权URL
      if (typeof response === 'string') {
        console.log('🔗 Google OAuth URL:', response);
        return response;
      }

      throw new Error('未收到有效的Google OAuth URL');
    } catch (error) {
      console.error('❌ 获取Google OAuth URL失败:', error);
      throw new Error(`获取Google OAuth URL失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Google 登录回调处理（支持登录和绑定两种模式）
   */
  static async googleLogin(code: string, state: string, hasToken: boolean = false): Promise<any> {
    console.log('🟢 Google Login with code:', code, 'state:', state, 'hasToken:', hasToken);

    const endpoint = `/client/common/google/login?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;

    try {
      // 尝试带token的请求（用于账号绑定）
      if (hasToken) {
        const response = await apiRequest(endpoint, {
          method: 'GET',
          requiresAuth: true
        });

        console.log('✅ Google Account Binding response:', response);

        // 响应格式: { "namespace": "string", "token": "string" }
        if (response.token) {
          localStorage.setItem('copus_token', response.token);
          console.log('🔑 New token saved to localStorage');
        }

        return { ...response, isBinding: true };
      } else {
        // 尝试不带token的请求（用于第三方登录）
        const response = await apiRequest(endpoint, {
          method: 'GET',
          requiresAuth: false
        });

        console.log('✅ Google Login response:', response);

        // 响应格式: { "namespace": "string", "token": "string" }
        if (response.token) {
          localStorage.setItem('copus_token', response.token);
          console.log('🔑 Token saved to localStorage');
        }

        return { ...response, isBinding: false };
      }
    } catch (error) {
      console.error('❌ Google Login/Binding failed:', error);
      throw new Error(`Google ${hasToken ? '账号绑定' : '登录'}失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 获取Metamask签名数据
   */
  static async getMetamaskSignatureData(address: string): Promise<any> {
    console.log('🔗 获取Metamask签名数据，地址:', address);

    const endpoint = `/client/common/getSnowflake?address=${encodeURIComponent(address)}`;

    try {
      const response = await apiRequest(endpoint, {
        method: 'GET',
        requiresAuth: false
      });

      console.log('✅ Metamask签名数据响应:', response);
      return response;
    } catch (error) {
      console.error('❌ 获取Metamask签名数据失败:', error);
      throw new Error(`获取签名数据失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Metamask 登录（支持登录和绑定两种模式）
   */
  static async metamaskLogin(address: string, signature: string, hasToken: boolean = false): Promise<any> {
    console.log('🦊 Metamask Login with address:', address, 'hasToken:', hasToken);

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

      console.log('✅ Metamask Login response:', response);

      // 响应格式: { "namespace": "string", "token": "string" }
      if (response.token) {
        localStorage.setItem('copus_token', response.token);
        console.log('🔑 Token saved to localStorage');
      }

      return { ...response, isBinding: hasToken };
    } catch (error) {
      console.error('❌ Metamask Login/Binding failed:', error);
      throw new Error(`Metamask ${hasToken ? '账号绑定' : '登录'}失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 获取用户信息
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

    // 如果传入了token，添加到headers中
    if (token) {
      options.headers = {
        'Authorization': `Bearer ${token}`
      };
    }

    const response = await apiRequest('/client/user/userInfo', options);
    // 用户信息在 response.data 中
    return response.data;
  }

  /**
   * 上传图片到S3
   */
  static async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    console.log('📤 上传图片到S3:', { fileName: file.name, fileSize: file.size, fileType: file.type });

    const response = await apiRequest('/client/common/uploadImage2S3', {
      method: 'POST',
      requiresAuth: true,
      body: formData,
    });

    console.log('📷 S3图片上传响应:', response);

    // 检查不同可能的响应格式
    if (response.status === 1 && response.data) {
      // 可能的响应格式：{ status: 1, data: { url: "..." } }
      if (response.data.url) {
        console.log('✅ 图片上传成功 (格式1):', response.data.url);
        return { url: response.data.url };
      }
      // 可能的响应格式：{ status: 1, data: "url" }
      if (typeof response.data === 'string' && (response.data.startsWith('http') || response.data.startsWith('https'))) {
        console.log('✅ 图片上传成功 (格式2):', response.data);
        return { url: response.data };
      }
    }

    // 检查是否直接返回URL
    if (response.url) {
      console.log('✅ 图片上传成功 (格式3):', response.url);
      return { url: response.url };
    }

    console.error('❌ 图片上传失败，未知响应格式:', response);
    throw new Error(response.msg || response.message || 'Image upload failed');
  }

  /**
   * 创建文章
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
   * 删除文章
   */
  static async deleteArticle(uuid: string): Promise<any> {
    return apiRequest(`/client/author/article/delete`, {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify({ uuid }),
    });
  }

  /**
   * 获取作品分类列表
   */
  static async getCategoryList(): Promise<ArticleCategoryListResponse> {
    return apiRequest('/client/author/article/categoryList', {
      method: 'GET',
      requiresAuth: true,
    });
  }

  /**
   * 获取文章详情
   */
  static async getArticleInfo(uuid: string): Promise<any> {
    const response = await apiRequest(`/client/reader/article/info?uuid=${uuid}`, {
      method: 'GET',
      requiresAuth: true,
    });

    // 添加文章接口的详细调试日志
    console.log('🔍 文章详情接口响应:', {
      原始数据: response,
      文章数据: response.data || response,
      作者字段: {
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
   * 点赞/取消点赞文章
   */
  static async likeArticle(uuid: string): Promise<any> {
    return apiRequest('/client/reader/article/like', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify({ uuid }),
    });
  }

  /**
   * 更新单个社交媒体链接
   */
  static async updateSocialLink(platform: string, url: string): Promise<any> {
    console.log(`📱 更新${platform}社交链接:`, url);

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
   * 批量更新社交媒体链接
   */
  static async updateAllSocialLinks(socialLinks: Record<string, string>): Promise<any> {
    console.log('📱 批量更新社交链接:', socialLinks);

    return apiRequest('/client/user/social-links', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify(socialLinks),
    });
  }

  /**
   * 获取用户宝藏信息（包含收藏统计）
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
    console.log('🏆 获取用户宝藏信息');

    return apiRequest('/client/myHome/userInfo', {
      method: 'GET',
      requiresAuth: true,
    });
  }

  /**
   * 获取用户收藏的文章列表（分页）
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
    console.log('📚 获取用户收藏文章列表:', { pageIndex, pageSize });

    return apiRequest(`/client/myHome/pageMyLikedArticle?pageIndex=${pageIndex}&pageSize=${pageSize}`, {
      method: 'GET',
      requiresAuth: true,
    });
  }

  /**
   * 获取用户社交链接列表
   */
  static async getUserSocialLinks(): Promise<Array<{
    iconUrl: string;
    id: number;
    linkUrl: string;
    sortOrder: number;
    title: string;
    userId: number;
  }>> {
    console.log('🔗 获取用户社交链接列表');

    const response = await apiRequest('/client/user/socialLink/links', {
      method: 'GET',
      requiresAuth: true,
    });

    console.log('📡 社交链接API原始响应:', response);

    // 处理不同的API响应格式
    if (Array.isArray(response)) {
      // 直接返回数组
      return response;
    } else if (response.data && Array.isArray(response.data)) {
      // 数据包装在data字段中
      return response.data;
    } else if (response.status === 1 && response.data) {
      // 标准响应格式：{status: 1, data: [...], msg: "..."}
      if (Array.isArray(response.data)) {
        return response.data;
      }
    }

    // 如果都不符合，返回空数组
    console.warn('⚠️ 未识别的社交链接API响应格式:', response);
    return [];
  }

  /**
   * 编辑/创建用户社交链接
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
    console.log('✏️ 编辑/创建社交链接:', params);

    const response = await apiRequest('/client/user/socialLink/edit', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify(params),
    });

    console.log('📡 编辑社交链接API原始响应:', response);

    // 处理不同的API响应格式
    if (response.iconUrl && response.id) {
      // 直接返回对象（理想情况）
      return response;
    } else if (response.data && response.data.iconUrl && response.data.id) {
      // 数据包装在data字段中（理想情况）
      return response.data;
    } else if (response.status === 1 && response.data) {
      // 标准响应格式：{status: 1, data: {...}, msg: "..."}
      console.log('🔧 API返回标准格式，但可能缺少ID字段');
      return response.data;
    } else if (response.iconUrl || response.linkUrl || response.title) {
      // 直接响应格式，但可能缺少ID（实际情况）
      console.log('⚠️ API返回数据缺少ID字段，这是正常情况');
      return response;
    }

    // 如果都不符合，抛出错误
    console.error('❌ 未识别的编辑社交链接API响应格式:', response);
    throw new Error(response.msg || response.message || 'Failed to edit social link');
  }

  /**
   * 删除用户社交链接
   */
  static async deleteSocialLink(id: number): Promise<boolean> {
    console.log('🗑️ 删除社交链接:', { id });

    const response = await apiRequest('/client/user/socialLink/delete', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify({ id }),
    });

    console.log('📡 删除社交链接API原始响应:', response);

    // 处理不同的API响应格式
    if (response === true || response === false) {
      // 直接返回布尔值
      return response;
    } else if (response.data === true || response.data === false) {
      // 数据包装在data字段中
      return response.data;
    } else if (response.status === 1 && response.data !== undefined) {
      // 标准响应格式：{status: 1, data: true, msg: "..."}
      return response.data === true;
    }

    // 如果都不符合，根据status判断
    console.warn('⚠️ 未识别的删除社交链接API响应格式:', response);
    return response.status === 1 || response.success === true;
  }

  /**
   * 更新用户namespace
   */
  static async updateUserNamespace(namespace: string): Promise<boolean> {
    console.log('✏️ 更新用户namespace:', namespace);

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

      console.log('✅ namespace更新响应:', response);

      // API返回布尔值true
      return response === true || response;
    } catch (error) {
      console.error('❌ 更新namespace失败:', error);
      throw error;
    }
  }

  /**
   * 修改密码
   */
  static async changePassword(params: ChangePasswordParams): Promise<boolean> {
    console.log('🔐 修改密码');

    try {
      const response = await apiRequest('/client/user/changePsw', {
        method: 'POST',
        body: JSON.stringify(params),
        requiresAuth: true,
      });

      console.log('✅ 密码修改成功');
      return response.status === 1;
    } catch (error) {
      console.error('❌ 修改密码失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户信息 - 增强版本为国君提供更多字段 ✨
   */
  static async updateUserInfo(params: {
    // 基础字段
    userName?: string;
    bio?: string;
    faceUrl?: string;
    coverUrl?: string;
    // 扩展字段 - 给国君更多数据！🎁
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
    [key: string]: any; // 允许更多未知字段
  }): Promise<boolean> {
    console.log('✏️ 小薇为国君更新用户信息 (豪华完整版):', params);
    console.log('📊 字段统计报告:', {
      传递字段总数: Object.keys(params).length,
      字段名称列表: Object.keys(params),
      '国君会很开心的': '因为数据很丰富！🎉',
      完整数据内容: params
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

      console.log('✅ 用户信息更新响应 (国君应该很满意):', response);
      console.log('🎯 成功传递给国君的字段数量:', Object.keys(params).length);
      return response.status === 1;
    } catch (error) {
      console.error('❌ 更新用户信息失败 (国君可能需要这个信息):', error);
      throw error;
    }
  }

  /**
   * 用户登出
   */
  static async logout(): Promise<any> {
    console.log('👋 用户登出');

    return apiRequest('/client/user/logout', {
      method: 'POST',
      requiresAuth: true,
    });
  }

  /**
   * 删除用户账号
   */
  static async deleteAccount(params: DeleteAccountParams): Promise<boolean> {
    console.log('🗑️ 删除用户账号', { accountType: params.accountType, reason: params.reason });

    try {
      const response = await apiRequest('/client/user/deleteUser', {
        method: 'POST',
        requiresAuth: true,
        body: JSON.stringify(params),
      });

      console.log('✅ 账号删除响应:', response);
      return response.status === 1;
    } catch (error) {
      console.error('❌ 删除账号失败:', error);
      throw error;
    }
  }

  /**
   * 发送验证码（新增：用于修改密码流程）
   */
  static async sendVerificationCode(email: string): Promise<boolean> {
    console.log('📧 发送验证码到邮箱:', email);

    try {
      const response = await apiRequest(
        `/client/common/getVerificationCode?codeType=3&email=${encodeURIComponent(email)}`,
        {
          method: 'GET',
          requiresAuth: true,
        }
      );

      console.log('✅ 验证码发送响应:', response);
      return response.status === 1;
    } catch (error) {
      console.error('❌ 发送验证码失败:', error);
      throw error;
    }
  }

  /**
   * 验证验证码（新增：用于修改密码流程）
   */
  static async verifyCode(email: string, code: string): Promise<boolean> {
    console.log('🔍 验证验证码:', { email, code });

    try {
      const response = await apiRequest('/client/common/verifyCode', {
        method: 'POST',
        requiresAuth: true,
        body: JSON.stringify({
          email,
          code,
          codeType: 3, // 修改密码类型
        }),
      });

      console.log('✅ 验证码验证响应:', response);
      return response.status === 1;
    } catch (error) {
      console.error('❌ 验证码验证失败:', error);
      throw error;
    }
  }

  /**
   * 更新密码（新增：验证通过后直接更新密码）
   */
  static async updatePassword(newPassword: string): Promise<boolean> {
    console.log('🔐 更新密码');

    try {
      const response = await apiRequest('/client/user/updatePassword', {
        method: 'POST',
        requiresAuth: true,
        body: JSON.stringify({
          newPassword,
        }),
      });

      console.log('✅ 密码更新响应:', response);
      return response.status === 1;
    } catch (error) {
      console.error('❌ 更新密码失败:', error);
      throw error;
    }
  }

  /**
   * 获取未读消息数量
   */
  static async getUnreadMessageCount(): Promise<number> {
    console.log('🔔 获取未读消息数量');

    try {
      const response = await apiRequest('/client/user/msg/countMsg', {
        method: 'GET',
        requiresAuth: true,
      });

      console.log('📬 未读消息数量响应:', response);

      // 处理不同的API响应格式
      if (typeof response === 'number') {
        // 直接返回数字
        return response;
      } else if (response.data !== undefined && typeof response.data === 'number') {
        // 数据包装在data字段中
        return response.data;
      } else if (response.status === 1 && response.data !== undefined) {
        // 标准响应格式：{status: 1, data: number, msg: "..."}
        return typeof response.data === 'number' ? response.data : 0;
      } else if (response.count !== undefined && typeof response.count === 'number') {
        // 可能的字段名：count
        return response.count;
      }

      // 如果都不符合，返回0
      console.warn('⚠️ 未识别的未读消息数量API响应格式:', response);
      return 0;
    } catch (error) {
      console.error('❌ 获取未读消息数量失败:', error);
      return 0; // 出错时返回0，不影响页面正常显示
    }
  }

  /**
   * 获取消息通知配置列表
   */
  static async getMessageNotificationSettings(): Promise<Array<{ isOpen: boolean; msgType: number }>> {
    console.log('🔔 获取消息通知配置列表...');
    try {
      const response = await apiRequest('/client/user/msg/console/page', {
        method: 'GET',
        requiresAuth: true
      });

      console.log('📋 消息通知配置API响应:', response);

      // 如果响应直接是数组
      if (Array.isArray(response)) {
        return response;
      }

      // 如果响应有data字段且是数组
      if (response && Array.isArray(response.data)) {
        return response.data;
      }

      console.warn('⚠️ 未识别的消息通知配置API响应格式:', response);
      return [];
    } catch (error) {
      console.error('❌ 获取消息通知配置失败:', error);
      return [];
    }
  }

  /**
   * 更新消息通知配置
   */
  static async updateMessageNotificationSetting(msgType: number, isOpen: boolean): Promise<boolean> {
    console.log(`🔄 更新消息通知配置: msgType=${msgType}, isOpen=${isOpen}`);
    try {
      const response = await apiRequest('/client/user/msg/console/changeState', {
        method: 'POST',
        requiresAuth: true,
        body: JSON.stringify({
          msgType,
          isOpen
        })
      });

      console.log('✅ 更新消息通知配置API响应:', response);

      // 根据你提供的信息，API直接返回 true 表示成功
      return response === true ||
             (response && response.data === true) ||
             (response && response.success === true);
    } catch (error) {
      console.error('❌ 更新消息通知配置失败:', error);
      return false;
    }
  }
}

// 验证码类型常量
export const CODE_TYPES = {
  REGISTER: 1,
  LOGIN: 2,
  RESET_PASSWORD: 3,
} as const;