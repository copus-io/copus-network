import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getPageArticles } from '../../services/articleService';
import { queryKeys, cacheConfig } from '../../lib/queryClient';
import { PageArticleParams } from '../../types/article';

// 基础文章列表查询
export const useArticlesQuery = (params: PageArticleParams = {}) => {
  return useQuery({
    queryKey: queryKeys.articlesList(params),
    queryFn: () => getPageArticles(params),
    ...cacheConfig.content,
    staleTime: 5 * 60 * 1000, // 5分钟
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

// 无限滚动文章列表查询
export const useInfiniteArticlesQuery = (params: PageArticleParams = {}) => {
  return useInfiniteQuery({
    queryKey: queryKeys.articlesInfinite(params),
    queryFn: ({ pageParam = 1 }) => getPageArticles({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    ...cacheConfig.content,
    staleTime: 5 * 60 * 1000, // 5分钟
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

// 带有便捷方法的文章查询 hook（兼容现有API）
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
      // 手动触发重新获取，这会更新查询键
      return query.refetch();
    },
    loadMore: () => {
      // 对于分页，建议使用 useInfiniteArticlesQuery
      console.warn('loadMore functionality should use useInfiniteArticlesQuery');
    },
  };
};