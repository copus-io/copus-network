import { useQuery } from '@tanstack/react-query';
import { getArticleDetail } from '../../services/articleService';
import { queryKeys, cacheConfig } from '../../lib/queryClient';

// 文章详情查询
export const useArticleDetailQuery = (uuid: string) => {
  return useQuery({
    queryKey: ['article', 'detail', uuid],
    queryFn: () => getArticleDetail(uuid),
    enabled: !!uuid, // 只有在 uuid 存在时才执行查询
    ...cacheConfig.content,
    staleTime: 10 * 60 * 1000, // 10分钟
    retry: 2,
  });
};

// 兼容现有API的文章详情查询 hook
export const useArticleDetail = (uuid: string) => {
  const query = useArticleDetailQuery(uuid);

  return {
    article: query.data || null,
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
  };
};