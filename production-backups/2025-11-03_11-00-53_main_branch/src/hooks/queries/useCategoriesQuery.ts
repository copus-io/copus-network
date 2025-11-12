import { useQuery } from '@tanstack/react-query';
import { getCategoryList } from '../../services/categoryService';
import { queryKeys, cacheConfig } from '../../lib/queryClient';

// 分类列表查询
export const useCategoriesQuery = () => {
  return useQuery({
    queryKey: queryKeys.categoriesList(),
    queryFn: getCategoryList,
    ...cacheConfig.static, // 分类数据变化较少，使用静态缓存策略
    staleTime: 30 * 60 * 1000, // 30分钟
    retry: 2,
  });
};

// 兼容现有API的分类查询 hook
export const useCategories = () => {
  const query = useCategoriesQuery();

  return {
    categories: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    refresh: query.refetch,
  };
};