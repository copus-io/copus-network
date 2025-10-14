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
    userAvatar: backendArticle.authorInfo.faceUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${backendArticle.authorInfo.username}&backgroundColor=b6e3f4&hair=longHair&hairColor=724133&eyes=happy&mouth=smile&accessories=prescription01&accessoriesColor=262e33`, // Dynamically generate default avatar
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

  if (params.page) queryParams.append('pageIndex', params.page.toString());
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
  if (params.category) queryParams.append('keyword', params.category);
  if (params.search) queryParams.append('keyword', params.search);

  const endpoint = `/client/home/pageArticle${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

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