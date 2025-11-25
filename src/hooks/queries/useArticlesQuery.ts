import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getPageArticles } from '../../services/articleService';
import { queryKeys, cacheConfig } from '../../lib/queryClient';
import { PageArticleParams } from '../../types/article';

// Basic articles list query
export const useArticlesQuery = (params: PageArticleParams = {}) => {
  return useQuery({
    queryKey: queryKeys.articlesList(params),
    queryFn: () => getPageArticles(params),
    ...cacheConfig.content,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

// Infinite scroll articles list query
export const useInfiniteArticlesQuery = (params: PageArticleParams = {}) => {
  return useInfiniteQuery({
    queryKey: queryKeys.articlesInfinite(params),
    queryFn: ({ pageParam = 1 }) => getPageArticles({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    ...cacheConfig.content,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

// Articles query hook with convenience methods (compatible with existing API)
export const useArticles = (initialParams: PageArticleParams = {}) => {
  const query = useArticlesQuery(initialParams);

  return {
    articles: query.data?.articles || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    hasMore: query.data?.hasMore || false,
    page: query.data?.page || 1,
    total: query.data?.total || 0,
    refresh: query.refetch,
    fetchArticles: (params: PageArticleParams = {}) => {
      // Manually trigger refetch, this will update the query key
      return query.refetch();
    },
    loadMore: () => {
      // For pagination, recommend using useInfiniteArticlesQuery
      console.warn('loadMore functionality should use useInfiniteArticlesQuery');
    },
  };
};