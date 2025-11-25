import { useQuery } from '@tanstack/react-query';
import { getMyCreatedArticles } from '../../services/articleService';
import { queryKeys, cacheConfig } from '../../lib/queryClient';
import { MyCreatedArticleParams } from '../../types/article';

// My created articles query
export const useMyCreatedArticlesQuery = (params: MyCreatedArticleParams = {}) => {
  return useQuery({
    queryKey: [...queryKeys.user, 'createdArticles', params],
    queryFn: () => getMyCreatedArticles(params),
    ...cacheConfig.user, // User-related data cache strategy
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: true, // User data refetched on window focus
  });
};

// My created articles query hook compatible with existing API
export const useMyCreatedArticles = (params: MyCreatedArticleParams = {}) => {
  const query = useMyCreatedArticlesQuery(params);

  return {
    articles: query.data || null,
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
  };
};