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
    if (!timestamp || timestamp === 0) return '';
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

      // Fix malformed extensions like '.svg+xml' -> '.svg'
      // This can happen when MIME type 'image/svg+xml' is incorrectly used as extension
      if (coverUrl.endsWith('+xml')) {
        coverUrl = coverUrl.replace(/\+xml$/, '');
      }

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
    const faceUrl = backendArticle.authorInfo?.faceUrl;
    if (isGeneratedAvatar(faceUrl)) {
      return profileDefaultAvatar;
    }
    return faceUrl || profileDefaultAvatar;
  };

  const transformedArticle = {
    id: backendArticle.uuid,
    numericId: backendArticle.id, // Numeric ID for bindArticles API
    title: backendArticle.title,
    description: backendArticle.content,
    category: backendArticle.categoryInfo?.name || '',
    categoryColor: backendArticle.categoryInfo?.color, // Save category color returned from backend
    coverImage: processImageUrl(backendArticle.coverUrl),
    userName: backendArticle.authorInfo?.username || 'Unknown',
    userId: backendArticle.authorInfo?.id,
    namespace: backendArticle.authorInfo?.namespace, // Add namespace field
    userAvatar: getUserAvatar(), // Two states only: user's real uploaded image or default image - no generated avatars
    date: formatTimestamp(backendArticle.createAt),
    treasureCount: backendArticle.likeCount,
    visitCount: backendArticle.viewCount,
    commentCount: backendArticle.commentCount || 0, // Total number of comments
    isLiked: backendArticle.isLiked, // Preserve like status returned from server
    website: getWebsiteFromUrl(backendArticle.targetUrl),
    url: backendArticle.targetUrl,
    // x402 payment fields
    isPaymentRequired: backendArticle.targetUrlIsLocked || false,
    paymentPrice: backendArticle.priceInfo?.price?.toString() || undefined,
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

  // Default to sorting by creation date (newest first) to keep posts in original order
  const sortBy = params.sortBy || 'createAt';
  const orderBy = params.orderBy || 'desc';
  queryParams.append('sortBy', sortBy);
  queryParams.append('orderBy', orderBy);

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

// Article detail cache
const articleDetailCache = new Map<string, {
  data: ArticleDetailResponse;
  timestamp: number;
  expiresAt: number;
}>();
const ARTICLE_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Types for article options
export interface GetArticleDetailOptions {
  bustCache?: boolean;
  forceRefresh?: boolean;
  retryCount?: number;
}

// Get article details with caching and error handling
export const getArticleDetail = async (
  uuid: string,
  options: GetArticleDetailOptions = {}
): Promise<ArticleDetailResponse> => {
  const { bustCache = false, forceRefresh = false, retryCount = 2 } = options;
  const cacheKey = uuid;

  // Check cache first (unless bust cache or force refresh)
  if (!bustCache && !forceRefresh) {
    const cached = articleDetailCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }
  }

  // Retry mechanism
  const executeRequest = async (attempt: number = 0): Promise<ArticleDetailResponse> => {
    try {
      // Add cache-busting timestamp when needed (e.g., after edit)
      const cacheBuster = bustCache ? `&_t=${Date.now()}` : '';
      const endpoint = `/client/reader/article/info?uuid=${uuid}${cacheBuster}`;

      // Article details are publicly viewable but will include token if available for personalized data
      const response = await apiRequest<{status: number, msg: string, data: ArticleDetailResponse}>(endpoint, {
        headers: bustCache ? {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        } : {},
        timeout: 10000 // 10 second timeout
      });

      // Validate API response
      if (response.status !== 1) {
        throw new Error(response.msg || 'API request failed');
      }

      // Validate required fields
      const data = response.data;
      if (!data || !data.uuid || !data.title) {
        throw new Error('Invalid article data received from API');
      }

      // Cache the successful result
      articleDetailCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ARTICLE_CACHE_DURATION
      });

      return data;
    } catch (error: any) {
      // Enhanced error handling with retry logic
      const errorMessage = error?.response?.data?.msg ||
                          error?.message ||
                          'Failed to fetch article detail';

      console.error(`❌ Failed to fetch article detail (attempt ${attempt + 1}):`, {
        uuid,
        error: errorMessage,
        timestamp: new Date().toISOString()
      });

      // Check if we should retry
      const shouldRetry = attempt < retryCount && (
        error?.status === 500 || // Server error
        error?.status === 502 || // Bad gateway
        error?.status === 503 || // Service unavailable
        error?.status === 504 || // Gateway timeout
        error?.code === 'NETWORK_ERROR' ||
        error?.code === 'TIMEOUT'
      );

      if (shouldRetry) {
        // Exponential backoff: wait 1s, 2s, 4s...
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        console.warn(`🔄 Retrying article detail request in ${delay}ms...`);

        await new Promise(resolve => setTimeout(resolve, delay));
        return executeRequest(attempt + 1);
      }

      // If all retries failed, try to return cached data if available
      const cached = articleDetailCache.get(cacheKey);
      if (cached) {
        console.warn('⚠️ Using stale cached data due to API failure');
        return cached.data;
      }

      // No cache available, throw the error
      throw new Error(errorMessage);
    }
  };

  return executeRequest();
};

// Clear article detail cache
export const clearArticleDetailCache = (uuid?: string): void => {
  if (uuid) {
    articleDetailCache.delete(uuid);
  } else {
    articleDetailCache.clear();
  }
};

// Preload article detail (fire and forget)
export const preloadArticleDetail = async (uuid: string): Promise<void> => {
  try {
    await getArticleDetail(uuid, { forceRefresh: false });
  } catch (error) {
    // Silently ignore preload errors
    console.debug('Article detail preload failed:', error);
  }
};

// Get article ID by UUID (optimized for frequent calls)
export const getArticleIdByUuid = async (uuid: string): Promise<number> => {
  try {
    const detail = await getArticleDetail(uuid, { forceRefresh: false });
    return detail.id;
  } catch (error) {
    console.error('Failed to get article ID:', error);
    throw new Error(`Failed to get article ID for UUID ${uuid}`);
  }
};

// Legacy method for backward compatibility
export const getArticleDetailLegacy = async (uuid: string, bustCache: boolean = false): Promise<ArticleDetailResponse> => {
  return getArticleDetail(uuid, { bustCache });
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
  uuid?: string; // Pass in edit mode
  title: string;
  content: string;
  coverUrl: string;
  targetUrl: string;
  categoryId: number;
  spaceIds?: number[]; // Optional: array of space IDs to save the article to
  targetUrlIsLocked?: boolean;
  priceInfo?: {
    chainId: string;
    currency: string;
    price: number;
  };
}): Promise<{ uuid: string }> => {

  const endpoint = '/client/author/article/edit';

  try {
    console.log('📤 Calling publishArticle API with data:', articleData);
    console.log('📤 Payment fields being sent to API:', {
      targetUrlIsLocked: articleData.targetUrlIsLocked,
      priceInfo: articleData.priceInfo || 'undefined/not included',
      fullPayload: JSON.stringify(articleData)
    });
    const response = await apiRequest<{status: number, msg: string, data: { uuid: string }}>(endpoint, {
      method: 'POST',
      body: JSON.stringify(articleData),
    });

    console.log('📥 publishArticle API response:', response);

    if (response.status !== 1) {
      throw new Error(response.msg || 'Failed to publish article');
    }

    return response.data;
  } catch (error) {
    console.error('❌ Failed to publish article:', error);
    throw new Error(`Failed to publish article: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};