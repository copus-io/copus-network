import { apiRequest } from './api';

export interface VerificationCodeParams {
  email: string;
  codeType: number; // 1: 注册, 2: 登录, 3: 重置密码等
}

export interface CheckEmailParams {
  email: string;
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
   * 注意: 后端接口尚未提供，此为预留接口
   */
  static async deleteArticle(uuid: string): Promise<any> {
    // 暂时使用假定的接口路径，等后端提供后更新
    return apiRequest(`/client/author/article/delete`, {
      method: 'DELETE',
      requiresAuth: true,
      body: JSON.stringify({ uuid }),
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
   * 用户登出
   */
  static async logout(): Promise<any> {
    console.log('👋 用户登出');

    return apiRequest('/client/user/logout', {
      method: 'POST',
      requiresAuth: true,
    });
  }
}

// 验证码类型常量
export const CODE_TYPES = {
  REGISTER: 1,
  LOGIN: 2,
  RESET_PASSWORD: 3,
} as const;