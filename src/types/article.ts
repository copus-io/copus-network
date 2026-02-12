/**
 * x402 Payment Protocol Types
 *
 * Types for handling x402 protocol payment integrations with ERC-3009
 * gasless USDC transfers.
 *
 * @see https://x402.gitbook.io/x402
 */

/**
 * Article visibility constants
 */
export const ARTICLE_VISIBILITY = {
  PUBLIC: 0,   // 公开 - 所有人可见
  PRIVATE: 1,  // 私享 - 仅作者可见
  UNLISTED: 2  // 未列出 - 仅通过直链访问
} as const;

export type ArticleVisibility = typeof ARTICLE_VISIBILITY[keyof typeof ARTICLE_VISIBILITY];

/**
 * Price information for paid content from backend API.
 *
 * @interface PriceInfo
 * @property {string} chainId - Blockchain network chain ID (e.g., "8453" for Base mainnet)
 * @property {string} currency - Token symbol (e.g., "USDC")
 * @property {number} price - Price in token's smallest unit (e.g., 1000000 = 1 USDC with 6 decimals)
 */
export interface PriceInfo {
  chainId: string;
  currency: string;
  price: number;
}

/**
 * x402 payment information from 402 Payment Required API response.
 * Contains all details needed to create a payment authorization.
 *
 * @interface X402PaymentInfo
 * @property {string} payTo - Recipient wallet address for payment
 * @property {string} asset - Token contract address (e.g., USDC contract)
 * @property {string} amount - Payment amount in smallest unit (e.g., "1000000" for 1 USDC)
 * @property {string} network - Network identifier (e.g., "base")
 * @property {string} resource - API endpoint URL to unlock content after payment
 *
 * @example
 * ```typescript
 * const paymentInfo: X402PaymentInfo = {
 *   payTo: '0x95C2259343Bca2E1c1E6bd4F0CBe5b4C8ac2890F',
 *   asset: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
 *   amount: '1000000', // 1 USDC
 *   network: 'base',
 *   resource: 'https://api.example.com/unlock/abc123'
 * };
 * ```
 */
export interface X402PaymentInfo {
  payTo: string;
  asset: string;
  amount: string;
  network: string;
  resource: string;
}

// Backend API raw data structures
export interface BackendAuthorInfo {
  id: number;
  namespace: string;
  username: string;
  faceUrl: string;
  bio?: string; // 作者个人简介，60字符限制
}

export interface BackendCategoryInfo {
  id: number;
  name: string;
  color: string;
  articleCount: number;
}

export interface BackendArticle {
  id: number; // Numeric article ID for bindArticles API
  uuid: string;
  authorInfo: BackendAuthorInfo;
  content: string;
  coverUrl: string;
  createAt: number;
  publishAt: number;
  targetUrl: string;
  title: string;
  viewCount: number;
  likeCount: number;
  commentCount: number; // Total number of comments
  isLiked: boolean;
  categoryInfo: BackendCategoryInfo;
  /**
   * x402 payment fields - indicates if content requires payment to unlock
   * @see {@link X402PaymentInfo}
   */
  targetUrlIsLocked?: boolean;
  priceInfo?: PriceInfo;
  /**
   * AR Chain ID - Arweave blockchain identifier for content storage
   */
  arChainId?: string;
  /**
   * SEO settings - custom meta description and keywords
   */
  seoDescription?: string;
  seoKeywords?: string;
  /**
   * Article visibility status
   * 0: Public (公开) - visible to everyone
   * 1: Private (私享) - only visible to author
   * 2: Unlisted (未列出) - accessible via direct link but not in public feeds
   */
  visibility?: number;
}

export interface BackendApiResponse {
  status: number;
  msg: string;
  data: {
    PageIndex: number;
    PageSize: number;
    totalCount: number;
    pageCount: number;
    data: BackendArticle[];
  };
}

// Frontend transformed data structures
export interface Article {
  id: string; // UUID for display/routing
  numericId: number; // Numeric ID for bindArticles API
  title: string;
  description: string;
  category: string;
  categoryColor?: string; // Category color field
  coverImage: string;
  userName: string;
  userId: number;
  namespace?: string; // User namespace field
  userAvatar: string;
  date: string;
  treasureCount: number;
  visitCount: number;
  commentCount: number; // Total number of comments
  isLiked: boolean; // Like status field
  website: string;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
  // Arweave chain ID for content storage
  arChainId?: string;
  // x402 payment fields
  paymentPrice?: string; // Price in USDC (e.g., "0.01")
  isPaymentRequired?: boolean; // Whether content requires payment
  // Article visibility status (0: public, 1: private, 2: unlisted)
  visibility?: number;
  // SEO fields
  seoDescription?: string;
  seoKeywords?: string;
}

export interface PageArticleResponse {
  articles: Article[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface PageArticleParams {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
  sortBy?: string; // Field to sort by (e.g., 'createAt', 'publishAt')
  orderBy?: 'asc' | 'desc'; // Sort order
}

// Article detail API response data structure
export interface ArticleDetailResponse {
  id: number; // Numeric article ID (for API calls like bindArticles)
  authorInfo: {
    faceUrl: string;
    id: number;
    namespace: string;
    username: string;
    bio?: string; // 作者个人简介
    coverUrl?: string; // 作者封面图
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
  commentCount: number; // Total number of comments for this article
  /**
   * Article visibility status
   * 0: Public (公开) - visible to everyone
   * 1: Private (私享) - only visible to author
   * 2: Unlisted (未列出) - accessible via direct link but not in public feeds
   */
  visibility: number;
  /**
   * Arweave chain ID for onchain content storage
   * @see https://arseed.web3infra.dev/
   */
  arChainId?: string;
  /**
   * x402 payment fields - indicates if content requires payment to unlock
   * @see {@link X402PaymentInfo}
   */
  targetUrlIsLocked?: boolean;
  priceInfo?: PriceInfo;
  /**
   * SEO data - JSON string containing custom SEO settings
   */
  seoData?: string;
  /**
   * AI-generated SEO data
   */
  seoDataByAi?: string;
}

// My created articles API parameters
export interface MyCreatedArticleParams {
  pageIndex?: number;
  pageSize?: number;
}

// My created articles API response data structure
export interface MyCreatedArticleResponse {
  data: ArticleDetailResponse[];
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  totalCount: number;
}

// My unlocked articles API parameters
export interface MyUnlockedArticleParams {
  pageIndex?: number;
  pageSize?: number;
  targetUserId: number;
}

// My unlocked articles API response data structure
export interface MyUnlockedArticleResponse {
  data: ArticleDetailResponse[];
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  totalCount: number;
}

// SEO settings for articles
export interface SEOSettings {
  description: string;
  keywords: string;
  uuid: string;
}

// SEO settings with JSON string format for API
export interface SEOSettingsRequest {
  uuid: string;
  seoData: string; // JSON string containing {"keywords": "", "description": ""}
}

// SEO settings API response
export interface SEOSettingsResponse {
  status: number;
  msg: string;
  data: boolean;
}

// Bind articles to spaces API types
export interface BindArticlesRequest {
  articleId: number;
  spaceIds: number[];
}

export interface BindArticlesResponse {
  isLiked: boolean;
  likeCount: number;
  state: boolean;
}

// Bind articles API response wrapper
export interface BindArticlesApiResponse {
  status: number;
  msg: string;
  data: BindArticlesResponse;
}

// Remove article from space request
export interface RemoveArticleFromSpaceRequest {
  articleId: number;
  spaceId: number;
}

// Remove article from space response
export interface RemoveArticleFromSpaceResponse {
  status: number;
  msg: string;
  data: boolean;
}

/**
 * Utility functions for article visibility
 */

/**
 * Check if an article is private
 */
export const isArticlePrivate = (article: { visibility?: number } | ArticleDetailResponse): boolean => {
  return article.visibility === ARTICLE_VISIBILITY.PRIVATE;
};

/**
 * Check if an article is public
 */
export const isArticlePublic = (article: { visibility?: number } | ArticleDetailResponse): boolean => {
  return article.visibility === ARTICLE_VISIBILITY.PUBLIC;
};

/**
 * Check if an article is unlisted
 */
export const isArticleUnlisted = (article: { visibility?: number } | ArticleDetailResponse): boolean => {
  return article.visibility === ARTICLE_VISIBILITY.UNLISTED;
};

/**
 * Check if a user can view an article based on visibility and ownership
 */
export const canUserViewArticle = (
  article: { visibility?: number; authorInfo?: { id: number }; userId?: number },
  userId?: number
): boolean => {
  // Public articles are always visible
  if (article.visibility === ARTICLE_VISIBILITY.PUBLIC) {
    return true;
  }

  // Private articles are only visible to the author
  if (article.visibility === ARTICLE_VISIBILITY.PRIVATE) {
    const authorId = article.authorInfo?.id || article.userId;
    return userId !== undefined && authorId === userId;
  }

  // Unlisted articles are visible via direct link (assume yes if checking)
  if (article.visibility === ARTICLE_VISIBILITY.UNLISTED) {
    return true;
  }

  // Default to public if visibility is not set
  return true;
};

/**
 * Convert visibility number to legacy isPrivate boolean (for backward compatibility)
 */
export const convertVisibilityToLegacyPrivate = (visibility?: number): boolean => {
  return visibility === ARTICLE_VISIBILITY.PRIVATE;
};

/**
 * Taste Profile API Response
 *
 * This is the structure returned by /api/taste/{username}.json
 * Used by external AIs (ChatGPT, Claude, etc.) to understand a user's taste/preferences
 *
 * Note: Only PUBLIC works are included in the curations array.
 * The stats.privateWorksCount tells AIs how many private works exist but aren't included.
 */
export interface TasteProfileResponse {
  /** Username */
  user: string;
  /** User's namespace (URL slug) */
  namespace: string;
  /** URL to user's Copus profile */
  profileUrl: string;

  /** Work statistics */
  stats: {
    /** Number of public works (included in curations) */
    publicWorksCount: number;
    /** Number of private works (NOT included in curations) */
    privateWorksCount: number;
    /** Total works count */
    totalWorksCount: number;
  };

  /** Array of public curations with AI-generated taste data */
  curations: TasteProfileCuration[];

  /** Note for AI explaining the data scope */
  note: string;
}

/**
 * Individual curation entry in taste profile
 */
export interface TasteProfileCuration {
  /** Article UUID */
  uuid: string;
  /** Article title */
  title: string;
  /** User's recommendation/curation note */
  recommendation: string;
  /** Original content URL */
  targetUrl: string;
  /** Cover image URL */
  coverUrl?: string;
  /** AI-generated SEO/taste data (JSON string) */
  seoDataByAi?: string;
  /** Creation timestamp */
  createdAt: string;
}