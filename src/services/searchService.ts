import { apiRequest } from './api';

// Search API response types
export interface SearchArticleItem {
  id: number;
  uuid: string;
  title: string;
  content: string;
  coverUrl: string;
  targetUrl: string;
  createAt: number;
  viewCount: number;
  likeCount: number;
  isLiked: boolean;
  // Privacy fields (new visibility system with legacy support)
  visibility?: number; // New visibility system (0: public, 1: private, 2: unlisted)
  isPrivate?: boolean; // Legacy privacy field for filtering
  authorInfo: {
    id: number;
    namespace: string;
    username: string;
    faceUrl: string;
  };
  categoryInfo: {
    id: number;
    name: string;
    color: string;
  };
}

export interface SearchSpaceItem {
  id: number;
  namespace: string;
  spaceType: number;
  articleCount: number;
  ownerInfo: {
    username: string;
    namespace: string;
    faceUrl?: string;
  };
  data: Array<{
    uuid: string;
    title: string;
    coverUrl: string;
    targetUrl: string;
  }>;
}

export interface SearchUserItem {
  id: number;
  namespace: string;
  username: string;
  faceUrl: string;
  articleCount: number;
  followerCount?: number;
}

interface SearchArticleResponse {
  status: number;
  msg: string;
  data: {
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    pageCount: number;
    data: SearchArticleItem[];
  };
}

interface SearchSpaceResponse {
  status: number;
  msg: string;
  data: {
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    pageCount: number;
    data: SearchSpaceItem[];
  };
}

interface SearchUserResponse {
  status: number;
  msg: string;
  data: {
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    pageCount: number;
    data: SearchUserItem[];
  };
}

export interface SearchParams {
  keyword: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface SearchResult<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  hasMore: boolean;
}

// Search for articles/works
export const searchArticles = async (params: SearchParams): Promise<SearchResult<SearchArticleItem>> => {
  const queryParams = new URLSearchParams();
  queryParams.append('keyword', params.keyword);
  queryParams.append('pageIndex', (params.pageIndex || 1).toString());
  queryParams.append('pageSize', (params.pageSize || 10).toString());

  const endpoint = `/client/home/searchArticle?${queryParams.toString()}`;

  try {
    const response = await apiRequest<SearchArticleResponse>(endpoint);

    if (response.status !== 1) {
      throw new Error(response.msg || 'Failed to search articles');
    }

    const data = response.data;
    return {
      items: data.data || [],
      totalCount: data.totalCount || 0,
      pageIndex: data.pageIndex || 1,
      pageSize: data.pageSize || 10,
      hasMore: data.pageIndex < data.pageCount,
    };
  } catch (error) {
    console.error('Failed to search articles:', error);
    throw error;
  }
};

// Search for spaces/treasuries
export const searchSpaces = async (params: SearchParams): Promise<SearchResult<SearchSpaceItem>> => {
  const queryParams = new URLSearchParams();
  queryParams.append('keyword', params.keyword);
  queryParams.append('pageIndex', (params.pageIndex || 1).toString());
  queryParams.append('pageSize', (params.pageSize || 10).toString());

  const endpoint = `/client/home/searchSpace?${queryParams.toString()}`;

  try {
    const response = await apiRequest<SearchSpaceResponse>(endpoint);

    if (response.status !== 1) {
      throw new Error(response.msg || 'Failed to search spaces');
    }

    const data = response.data;
    return {
      items: data.data || [],
      totalCount: data.totalCount || 0,
      pageIndex: data.pageIndex || 1,
      pageSize: data.pageSize || 10,
      hasMore: data.pageIndex < data.pageCount,
    };
  } catch (error) {
    console.error('Failed to search spaces:', error);
    throw error;
  }
};

// Search for users
export const searchUsers = async (params: SearchParams): Promise<SearchResult<SearchUserItem>> => {
  const queryParams = new URLSearchParams();
  queryParams.append('keyword', params.keyword);
  queryParams.append('pageIndex', (params.pageIndex || 1).toString());
  queryParams.append('pageSize', (params.pageSize || 10).toString());

  const endpoint = `/client/home/searchUser?${queryParams.toString()}`;

  try {
    const response = await apiRequest<SearchUserResponse>(endpoint);

    if (response.status !== 1) {
      throw new Error(response.msg || 'Failed to search users');
    }

    const data = response.data;
    return {
      items: data.data || [],
      totalCount: data.totalCount || 0,
      pageIndex: data.pageIndex || 1,
      pageSize: data.pageSize || 10,
      hasMore: data.pageIndex < data.pageCount,
    };
  } catch (error) {
    console.error('Failed to search users:', error);
    throw error;
  }
};

// Search all categories in parallel (for "All" tab)
export const searchAll = async (params: SearchParams): Promise<{
  articles: SearchResult<SearchArticleItem>;
  spaces: SearchResult<SearchSpaceItem>;
  users: SearchResult<SearchUserItem>;
}> => {
  const [articles, spaces, users] = await Promise.all([
    searchArticles(params).catch(() => ({ items: [], totalCount: 0, pageIndex: 1, pageSize: 10, hasMore: false })),
    searchSpaces(params).catch(() => ({ items: [], totalCount: 0, pageIndex: 1, pageSize: 10, hasMore: false })),
    searchUsers(params).catch(() => ({ items: [], totalCount: 0, pageIndex: 1, pageSize: 10, hasMore: false })),
  ]);

  return { articles, spaces, users };
};
