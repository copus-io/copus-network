import { useQuery } from '@tanstack/react-query';
import { getMyCreatedArticles } from '../../services/articleService';
import { queryKeys, cacheConfig } from '../../lib/queryClient';
import { MyCreatedArticleParams } from '../../types/article';

// 我创建的文章查询
export const useMyCreatedArticlesQuery = (params: MyCreatedArticleParams = {}) => {
  return useQuery({
    queryKey: [...queryKeys.user, 'createdArticles', params],
    queryFn: () => getMyCreatedArticles(params),
    ...cacheConfig.user, // 用户相关数据缓存策略
    staleTime: 10 * 60 * 1000, // 10分钟
    retry: 2,
    refetchOnWindowFocus: true, // 用户数据在窗口聚焦时重新获取
  });
};

// 兼容现有API的我创建的文章查询 hook
export const useMyCreatedArticles = (params: MyCreatedArticleParams = {}) => {
  const query = useMyCreatedArticlesQuery(params);

  return {
    articles: query.data || null,
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
  };
};