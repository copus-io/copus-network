import { apiRequest } from './api';
import { PageArticleResponse, PageArticleParams, BackendApiResponse, Article, BackendArticle, ArticleDetailResponse, MyCreatedArticleResponse, MyCreatedArticleParams } from '../types/article';

// 将后端数据转换为前端需要的格式
const transformBackendArticle = (backendArticle: BackendArticle): Article => {
  // 从URL中提取域名作为website
  const getWebsiteFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'unknown.com';
    }
  };

  // 时间戳转日期字符串
  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp * 1000).toISOString();
  };

  // 验证和处理图片URL
  const processImageUrl = (coverUrl: string | null | undefined): string => {
    if (!coverUrl || coverUrl.trim() === '') {
      console.warn('Empty coverUrl from backend for article:', backendArticle.uuid, backendArticle.title);
      return '';
    }

    // 检查是否是有效的URL
    try {
      new URL(coverUrl);
      console.log('Valid coverUrl:', coverUrl);
      return coverUrl;
    } catch (error) {
      console.warn('Invalid coverUrl from backend:', coverUrl, 'for article:', backendArticle.uuid);
      return '';
    }
  };

  const transformedArticle = {
    id: backendArticle.uuid,
    title: backendArticle.title,
    description: backendArticle.content,
    category: backendArticle.categoryInfo.name,
    coverImage: processImageUrl(backendArticle.coverUrl),
    userName: backendArticle.authorInfo.username,
    userAvatar: backendArticle.authorInfo.faceUrl || 'https://c.animaapp.com/mft5gmofxQLTNf/img/-profile-image-4.png', // 默认头像
    date: formatTimestamp(backendArticle.createAt),
    treasureCount: backendArticle.likeCount,
    visitCount: backendArticle.viewCount,
    website: getWebsiteFromUrl(backendArticle.targetUrl),
    url: backendArticle.targetUrl,
  };

  console.log('Transformed article:', {
    id: transformedArticle.id,
    title: transformedArticle.title,
    originalCoverUrl: backendArticle.coverUrl,
    transformedCoverImage: transformedArticle.coverImage
  });

  return transformedArticle;
};

// 获取分页文章列表
export const getPageArticles = async (params: PageArticleParams = {}): Promise<PageArticleResponse> => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('pageIndex', params.page.toString());
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
  if (params.category) queryParams.append('keyword', params.category);
  if (params.search) queryParams.append('keyword', params.search);

  const endpoint = `/client/home/pageArticle${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

  const backendResponse = await apiRequest<BackendApiResponse>(endpoint, { requiresAuth: true });

  if (backendResponse.status !== 1) {
    throw new Error(backendResponse.msg || 'API request failed');
  }

  const { data } = backendResponse.data;

  return {
    articles: data.map(transformBackendArticle),
    total: backendResponse.data.totalCount,
    page: backendResponse.data.PageIndex,
    pageSize: backendResponse.data.PageSize,
    hasMore: backendResponse.data.PageIndex < backendResponse.data.pageCount,
  };
};

// 获取文章详情
export const getArticleDetail = async (uuid: string): Promise<ArticleDetailResponse> => {
  console.log('🔍 Getting article detail for uuid:', uuid);

  const endpoint = `/client/reader/article/info?uuid=${uuid}`;

  try {
    const response = await apiRequest<{status: number, msg: string, data: ArticleDetailResponse}>(endpoint, { requiresAuth: true });
    console.log('✅ Article detail API response:', response);

    if (response.status !== 1) {
      throw new Error(response.msg || 'API request failed');
    }

    console.log('📋 Extracted article data:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch article detail:', error);
    throw new Error(`Failed to fetch article detail: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// 获取我创作的作品
export const getMyCreatedArticles = async (params: MyCreatedArticleParams = {}): Promise<MyCreatedArticleResponse> => {
  console.log('🔍 Getting my created articles with params:', params);

  const queryParams = new URLSearchParams();
  if (params.pageIndex !== undefined) queryParams.append('pageIndex', params.pageIndex.toString());
  if (params.pageSize !== undefined) queryParams.append('pageSize', params.pageSize.toString());

  const endpoint = `/client/myHome/pageMyCreatedArticle${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

  try {
    const response = await apiRequest<{status: number, msg: string, data: MyCreatedArticleResponse}>(endpoint, { requiresAuth: true });
    console.log('✅ My created articles API response:', response);

    if (response.status !== 1) {
      throw new Error(response.msg || 'API request failed');
    }

    console.log('📋 提取的真实数据:', response.data);
    console.log('📊 数据详情:', {
      hasData: !!response.data.data,
      dataLength: response.data.data?.length,
      pageCount: response.data.pageCount,
      totalCount: response.data.totalCount
    });

    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch my created articles:', error);
    throw new Error(`Failed to fetch my created articles: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// 发布文章
export const publishArticle = async (articleData: {
  title: string;
  content: string;
  coverUrl: string;
  targetUrl: string;
  categoryId: number;
}): Promise<{ uuid: string }> => {
  console.log('📝 Publishing article with data:', articleData);

  const endpoint = '/client/author/article/edit';

  try {
    const response = await apiRequest<{status: number, msg: string, data: { uuid: string }}>(endpoint, {
      method: 'POST',
      body: JSON.stringify(articleData),
      requiresAuth: true,
    });

    console.log('✅ Publish article API response:', response);

    if (response.status !== 1) {
      throw new Error(response.msg || 'Failed to publish article');
    }

    console.log('🎉 Article published successfully with UUID:', response.data.uuid);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to publish article:', error);
    throw new Error(`Failed to publish article: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};