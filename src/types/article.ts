// Backend API raw data structure
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
  // x402 payment fields
  targetUrlIsLocked?: boolean;
  priceInfo?: {
    chainId: string;
    currency: string;
    price: number;
  };
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

// Frontend transformed data structure
export interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryColor?: string; // Add category color field
  coverImage: string;
  userName: string;
  userId: number;
  namespace?: string; // Add user namespace field
  userAvatar: string;
  date: string;
  treasureCount: number;
  visitCount: number;
  isLiked: boolean; // Add like status field
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
}

// Article detail API response data structure
export interface ArticleDetailResponse {
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
  arChainId?: string; // Arweave chain ID for onchain storage
  // x402 payment fields
  targetUrlIsLocked?: boolean;
  priceInfo?: {
    chainId: string;
    currency: string;
    price: number;
  };
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