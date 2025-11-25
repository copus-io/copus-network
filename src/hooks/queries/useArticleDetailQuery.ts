import { useQuery } from '@tanstack/react-query';
import { getArticleDetail } from '../../services/articleService';
import { queryKeys, cacheConfig } from '../../lib/queryClient';

// Article detail query
export const useArticleDetailQuery = (uuid: string) => {
  return useQuery({
    queryKey: ['article', 'detail', uuid],
    queryFn: () => getArticleDetail(uuid),
    enabled: !!uuid, // Only execute query when uuid exists
    ...cacheConfig.content,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

// Article detail query hook compatible with existing API
export const useArticleDetail = (uuid: string) => {
  const query = useArticleDetailQuery(uuid);

  return {
    article: query.data || null,
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
  };
};