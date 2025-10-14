import { apiRequest } from './api';
import { PageArticleResponse, PageArticleParams, BackendApiResponse, Article, BackendArticle, ArticleDetailResponse, MyCreatedArticleResponse, MyCreatedArticleParams } from '../types/article';

// Transform backend data to frontend required format
const transformBackendArticle = (backendArticle: BackendArticle): Article => {
  // Extract domain from URL as website
  const getWebsiteFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'unknown.com';
    }
  };

  // Convert timestamp to date string
  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp * 1000).toISOString();
  };

  // Validate and process image URL
  const processImageUrl = (coverUrl: string | null | undefined): string => {
    if (!coverUrl || coverUrl.trim() === '') {
      return '';
    }

    // Check if it's a valid URL
    try {
      new URL(coverUrl);
      return coverUrl;
    } catch (error) {
      return '';
    }
  };


  const transformedArticle = {
    id: backendArticle.uuid,
    title: backendArticle.title,
    description: backendArticle.content,
    category: backendArticle.categoryInfo.name,
    categoryColor: backendArticle.categoryInfo.color, // Save category color returned from backend
    coverImage: processImageUrl(backendArticle.coverUrl),
    userName: backendArticle.authorInfo.username,
    userId: backendArticle.authorInfo.id,
    namespace: backendArticle.authorInfo.namespace, // Add namespace field
    userAvatar: backendArticle.authorInfo.faceUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${backendArticle.authorInfo.username}&backgroundColor=b6e3f4`, // Dynamically generate default avatar
    date: formatTimestamp(backendArticle.createAt),
    treasureCount: backendArticle.likeCount,
    visitCount: backendArticle.viewCount,
    isLiked: backendArticle.isLiked, // Preserve like status returned from server
    website: getWebsiteFromUrl(backendArticle.targetUrl),
    url: backendArticle.targetUrl,
  };


  return transformedArticle;
};

// Get paginated article list
export const getPageArticles = async (params: PageArticleParams = {}): Promise<PageArticleResponse> => {
  const queryParams = new URLSearchParams();

  // 确保总是有page参数，默认为第1页
  const page = params.page || 1;
  queryParams.append('pageIndex', page.toString()); // 后端也使用1基页码系统

  // 确保总是有pageSize参数
  const pageSize = params.pageSize || 10;
  queryParams.append('pageSize', pageSize.toString());

  if (params.category) queryParams.append('keyword', params.category);
  if (params.search) queryParams.append('keyword', params.search);

  const endpoint = `/client/home/pageArticle?${queryParams.toString()}`;


  // Try with authentication first for personalized data, fallback to no-auth for guests
  let backendResponse: BackendApiResponse;
  try {
    // Check if user is logged in by looking for token
    const token = localStorage.getItem('copus_token');
    if (token) {
      backendResponse = await apiRequest<BackendApiResponse>(endpoint, { requiresAuth: true });
    } else {
      backendResponse = await apiRequest<BackendApiResponse>(endpoint, { requiresAuth: false });
    }
  } catch (error) {
    // If auth fails, try without authentication
    backendResponse = await apiRequest<BackendApiResponse>(endpoint, { requiresAuth: false });
  }

  // 处理不同的响应格式
  let responseData = backendResponse as any;

  // 检查是否是包装格式 {status: 1, data: {...}}
  if (responseData.status === 1 && responseData.data) {
    responseData = responseData.data;
  }

  // 确保articles数组存在
  let articlesArray = [];

  if (Array.isArray(responseData.data)) {
    articlesArray = responseData.data;
  } else if (Array.isArray(responseData)) {
    articlesArray = responseData;
  } else if (responseData.data && Array.isArray(responseData.data.data)) {
    articlesArray = responseData.data.data;
  }

  // 安全检查：确保articlesArray是数组且有map方法
  if (!Array.isArray(articlesArray)) {
    articlesArray = [];
  }

  // 分页信息处理
  const pageIndex = responseData.pageIndex || 0;
  const pageCount = responseData.pageCount || 0;
  const totalCount = responseData.totalCount || 0;
  const currentPageSize = responseData.pageSize || 10;
  const hasMore = pageIndex < pageCount; // 后端使用1基页码，所以不需要+1

  return {
    articles: articlesArray.map(transformBackendArticle),
    total: totalCount,
    page: pageIndex, // 后端返回的页码就是1基的，直接使用
    pageSize: currentPageSize,
    hasMore: hasMore,
  };
};

// Get article details
export const getArticleDetail = async (uuid: string): Promise<ArticleDetailResponse> => {

  const endpoint = `/client/reader/article/info?uuid=${uuid}`;

  try {
    const response = await apiRequest<{status: number, msg: string, data: ArticleDetailResponse}>(endpoint, { requiresAuth: true });

    if (response.status !== 1) {
      throw new Error(response.msg || 'API request failed');
    }

    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch article detail:', error);
    throw new Error(`Failed to fetch article detail: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Get my created articles
export const getMyCreatedArticles = async (params: MyCreatedArticleParams = {}): Promise<MyCreatedArticleResponse> => {

  const queryParams = new URLSearchParams();
  if (params.pageIndex !== undefined) queryParams.append('pageIndex', params.pageIndex.toString());
  if (params.pageSize !== undefined) queryParams.append('pageSize', params.pageSize.toString());

  const endpoint = `/client/myHome/pageMyCreatedArticle${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

  try {
    const response = await apiRequest<{status: number, msg: string, data: MyCreatedArticleResponse}>(endpoint, { requiresAuth: true });

    if (response.status !== 1) {
      throw new Error(response.msg || 'API request failed');
    }


    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch my created articles:', error);
    throw new Error(`Failed to fetch my created articles: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Publish article (supports creation and editing)
export const publishArticle = async (articleData: {
  uuid?: string; // Pass when in edit mode
  title: string;
  content: string;
  coverUrl: string;
  targetUrl: string;
  categoryId: number;
}): Promise<{ uuid: string }> => {

  const endpoint = '/client/author/article/edit';

  try {
    const response = await apiRequest<{status: number, msg: string, data: { uuid: string }}>(endpoint, {
      method: 'POST',
      body: JSON.stringify(articleData),
      requiresAuth: true,
    });


    if (response.status !== 1) {
      throw new Error(response.msg || 'Failed to publish article');
    }

    return response.data;
  } catch (error) {
    console.error('❌ Failed to publish article:', error);
    throw new Error(`Failed to publish article: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};