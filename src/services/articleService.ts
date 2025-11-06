import { apiRequest } from './api';
import { PageArticleResponse, PageArticleParams, BackendApiResponse, Article, BackendArticle, ArticleDetailResponse, MyCreatedArticleResponse, MyCreatedArticleParams, MyUnlockedArticleResponse, MyUnlockedArticleParams } from '../types/article';
import profileDefaultAvatar from '../assets/images/profile-default.svg';

// Transform backend data to frontend required format
const transformBackendArticle = (backendArticle: BackendArticle): Article => {
  // Debug: Log raw backend article payment data
  if (backendArticle.targetUrlIsLocked || backendArticle.priceInfo) {
    console.log('🔍 Backend article with payment data:', {
      title: backendArticle.title.substring(0, 30),
      targetUrlIsLocked: backendArticle.targetUrlIsLocked,
      priceInfo: backendArticle.priceInfo,
      priceType: typeof backendArticle.priceInfo?.price
    });
  }

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


  // Check if faceUrl is a real user-uploaded image or a generated avatar
  const isGeneratedAvatar = (url: string | null | undefined): boolean => {
    if (!url) return true;
    const lowerUrl = url.toLowerCase();
    // List of known avatar generation services to filter out
    return lowerUrl.includes('dicebear') ||
           lowerUrl.includes('ui-avatars') ||
           lowerUrl.includes('avatar') && lowerUrl.includes('api') ||
           lowerUrl.includes('gravatar') ||
           lowerUrl.includes('robohash') ||
           lowerUrl.includes('adorable.io') ||
           lowerUrl.includes('avatar.iran.liara.run') ||
           url.trim() === '';
  };

  // Determine the user avatar: only use faceUrl if it's a real uploaded image, otherwise use default
  const getUserAvatar = (): string => {
    const faceUrl = backendArticle.authorInfo.faceUrl;
    if (isGeneratedAvatar(faceUrl)) {
      return profileDefaultAvatar;
    }
    return faceUrl!;
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
    userAvatar: getUserAvatar(), // Two states only: user's real uploaded image or default image - no generated avatars
    date: formatTimestamp(backendArticle.createAt),
    treasureCount: backendArticle.likeCount,
    visitCount: backendArticle.viewCount,
    isLiked: backendArticle.isLiked, // Preserve like status returned from server
    website: getWebsiteFromUrl(backendArticle.targetUrl),
    url: backendArticle.targetUrl,
    // x402 payment fields
    isPaymentRequired: backendArticle.targetUrlIsLocked || false,
    paymentPrice: backendArticle.priceInfo?.price?.toString() || undefined,
  };

  // Debug: Log transformed article to verify payment fields are included
  if (transformedArticle.isPaymentRequired || transformedArticle.paymentPrice) {
    console.log('✅ Transformed article WITH payment data:', {
      title: transformedArticle.title.substring(0, 30),
      isPaymentRequired: transformedArticle.isPaymentRequired,
      paymentPrice: transformedArticle.paymentPrice,
      originalPrice: backendArticle.priceInfo?.price,
      originalPriceType: typeof backendArticle.priceInfo?.price
    });
  }

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


  // Make the request - token will be included automatically if available
  let backendResponse: BackendApiResponse;
  try {
    backendResponse = await apiRequest<BackendApiResponse>(endpoint);
  } catch (error) {
    console.error('❌ Failed to fetch articles:', error);
    throw new Error('Failed to load articles. Please refresh the page and try again.');
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
export const getArticleDetail = async (uuid: string, bustCache: boolean = false): Promise<ArticleDetailResponse> => {

  // Add cache-busting timestamp when needed (e.g., after edit)
  const cacheBuster = bustCache ? `&_t=${Date.now()}` : '';
  const endpoint = `/client/reader/article/info?uuid=${uuid}${cacheBuster}`;

  try {
    // Article details are publicly viewable but will include token if available for personalized data
    const response = await apiRequest<{status: number, msg: string, data: ArticleDetailResponse}>(endpoint, {
      headers: bustCache ? {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      } : {}
    });

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

  const endpoint = `/client/userHome/pageMyCreatedArticle${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

  try {
    const response = await apiRequest<{status: number, msg: string, data: MyCreatedArticleResponse}>(endpoint);

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
    const response = await apiRequest<{status: number, msg: string, data: MyUnlockedArticleResponse}>(endpoint);

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
  uuid?: string; // 编辑模式时传递
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