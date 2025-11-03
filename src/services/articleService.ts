import { apiRequest } from './api';
import { PageArticleResponse, PageArticleParams, BackendApiResponse, Article, BackendArticle, ArticleDetailResponse, MyCreatedArticleResponse, MyCreatedArticleParams, MyUnlockedArticleResponse, MyUnlockedArticleParams } from '../types/article';
import profileDefaultAvatar from '../assets/images/profile-default.svg';

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
    userAvatar: backendArticle.authorInfo.faceUrl || profileDefaultAvatar, // Use default profile avatar
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

  // Ensure page parameter is always present, default to page 1
  const page = params.page || 1;
  queryParams.append('pageIndex', page.toString()); // Backend also uses 1-based page numbering

  // Ensure pageSize parameter is always present
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

  // Handle different response formats
  let responseData = backendResponse as any;

  // Check if it's wrapped format {status: 1, data: {...}}
  if (responseData.status === 1 && responseData.data) {
    responseData = responseData.data;
  }

  // Ensure articles array exists
  let articlesArray = [];

  if (Array.isArray(responseData.data)) {
    articlesArray = responseData.data;
  } else if (Array.isArray(responseData)) {
    articlesArray = responseData;
  } else if (responseData.data && Array.isArray(responseData.data.data)) {
    articlesArray = responseData.data.data;
  }

  // Safety check: ensure articlesArray is an array with map method
  if (!Array.isArray(articlesArray)) {
    articlesArray = [];
  }

  // Pagination info processing
  const pageIndex = responseData.pageIndex || 0;
  const pageCount = responseData.pageCount || 0;
  const totalCount = responseData.totalCount || 0;
  const currentPageSize = responseData.pageSize || 10;
  const hasMore = pageIndex < pageCount; // Backend uses 1-based page numbering, so no need to +1

  return {
    articles: articlesArray.map(transformBackendArticle),
    total: totalCount,
    page: pageIndex, // Backend returns 1-based page number, use directly
    pageSize: currentPageSize,
    hasMore: hasMore,
  };
};

// Get article details
export const getArticleDetail = async (uuid: string): Promise<ArticleDetailResponse> => {

  const endpoint = `/client/reader/article/info?uuid=${uuid}`;

  try {
    // requiresAuth: false - article details should be publicly viewable without login
    // Only interactions (like, comment, etc.) require authentication
    const response = await apiRequest<{status: number, msg: string, data: ArticleDetailResponse}>(endpoint, { requiresAuth: false });

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

// Get my unlocked articles
export const getMyUnlockedArticles = async (params: MyUnlockedArticleParams): Promise<MyUnlockedArticleResponse> => {

  const queryParams = new URLSearchParams();
  if (params.pageIndex !== undefined) queryParams.append('pageIndex', params.pageIndex.toString());
  if (params.pageSize !== undefined) queryParams.append('pageSize', params.pageSize.toString());
  queryParams.append('targetUserId', params.targetUserId.toString());

  const endpoint = `/client/userHome/pageMyUnlockedArticle?${queryParams.toString()}`;

  try {
    const response = await apiRequest<{status: number, msg: string, data: MyUnlockedArticleResponse}>(endpoint, { requiresAuth: true });

    if (response.status !== 1) {
      throw new Error(response.msg || 'API request failed');
    }

    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch my unlocked articles:', error);
    throw new Error(`Failed to fetch my unlocked articles: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
}): Promise<string> => {

  const endpoint = '/client/author/article/edit';

  try {
    const response = await apiRequest<{status: number, msg: string, data: string}>(endpoint, {
      method: 'POST',
      body: JSON.stringify(articleData),
      requiresAuth: true,
    });

    console.log('🔍 Raw API response from publishArticle:', response);
    console.log('🔍 Response status:', response.status);
    console.log('🔍 Response data (UUID):', response.data);

    if (response.status !== 1) {
      throw new Error(response.msg || 'Failed to publish article');
    }

    console.log('🔍 Returning UUID string:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to publish article:', error);
    throw new Error(`Failed to publish article: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Track article visit/view - ensures visit count is incremented
export const trackArticleVisit = async (uuid: string): Promise<void> => {
  console.log('📊 Tracking article visit for UUID:', uuid);

  const endpoint = `/client/reader/article/visit?uuid=${uuid}`;

  try {
    // requiresAuth: false - anyone should be able to increment view count, not just logged-in users
    const response = await apiRequest<{status: number, msg: string}>(endpoint, {
      requiresAuth: false,
      method: 'POST'
    });

    if (response.status !== 1) {
      console.warn('⚠️ Visit tracking API returned non-success status:', response.msg);
      // Don't throw error - visit tracking failure shouldn't break the page
    } else {
      console.log('✅ Article visit tracked successfully');
    }
  } catch (error) {
    console.warn('⚠️ Failed to track article visit (non-critical):', error);
    // Don't throw error - visit tracking failure shouldn't break the page
  }
};