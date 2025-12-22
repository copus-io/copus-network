/**
 * x402 Payment Protocol Types
 *
 * Types for handling x402 protocol payment integrations with ERC-3009
 * gasless USDC transfers.
 *
 * @see https://x402.gitbook.io/x402
 */

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
  isLiked: boolean;
  categoryInfo: BackendCategoryInfo;
  /**
   * x402 payment fields - indicates if content requires payment to unlock
   * @see {@link X402PaymentInfo}
   */
  targetUrlIsLocked?: boolean;
  priceInfo?: PriceInfo;
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
  isLiked: boolean; // Like status field
  website: string;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
  // x402 payment fields
  paymentPrice?: string; // Price in USDC (e.g., "0.01")
  isPaymentRequired?: boolean; // Whether content requires payment
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