import { useQuery } from '@tanstack/react-query';
import { getCategoryList } from '../../services/categoryService';
import { queryKeys, cacheConfig } from '../../lib/queryClient';

// Categories list query
export const useCategoriesQuery = () => {
  return useQuery({
    queryKey: queryKeys.categoriesList(),
    queryFn: getCategoryList,
    ...cacheConfig.static, // Category data changes infrequently, use static cache strategy
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
};

// Categories query hook compatible with existing API
export const useCategories = () => {
  const query = useCategoriesQuery();

  return {
    categories: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    refresh: query.refetch,
  };
};