// 后端API返回的原始数据结构
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

// 前端使用的转换后的数据结构
export interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  coverImage: string;
  userName: string;
  userAvatar: string;
  date: string;
  treasureCount: number;
  visitCount: number;
  website: string;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
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

// 文章详情API返回的数据结构
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
}

// 我创作的作品API参数
export interface MyCreatedArticleParams {
  pageIndex?: number;
  pageSize?: number;
}

// 我创作的作品API返回的数据结构
export interface MyCreatedArticleResponse {
  data: ArticleDetailResponse[];
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  totalCount: number;
}