import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publishArticle } from '../../services/articleService';
import { queryKeys, cacheConfig } from '../../lib/queryClient';

// Article publish mutation with cache optimization
export const usePublishArticleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publishArticle,
    onSuccess: (data) => {
      // After successful publish, invalidate related queries and refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.articles });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.user, 'createdArticles'] });

      // Prefill new article detail query
      queryClient.setQueryData(['article', 'detail', data.uuid], data);
    },
    onError: (error) => {
      console.error('Failed to publish article:', error);
    },
  });
};

// Optimized hook for prefetching article details
export const usePrefetchArticleDetail = () => {
  const queryClient = useQueryClient();

  return (uuid: string) => {
    queryClient.prefetchQuery({
      queryKey: ['article', 'detail', uuid],
      queryFn: async () => {
        const { getArticleDetail } = await import('../../services/articleService');
        return getArticleDetail(uuid);
      },
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };
};

// Batch prefetch article details
export const useBatchPrefetchArticles = () => {
  const queryClient = useQueryClient();

  return (articleIds: string[]) => {
    articleIds.forEach((uuid) => {
      queryClient.prefetchQuery({
        queryKey: ['article', 'detail', uuid],
        queryFn: async () => {
          const { getArticleDetail } = await import('../../services/articleService');
          return getArticleDetail(uuid);
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
      });
    });
  };
};

// Optimized user data query, combined with social links
export const useUserProfileWithLinks = (userId?: string) => {
  return useQuery({
    queryKey: queryKeys.userProfile(userId),
    queryFn: async () => {
      // Here we can combine multiple API calls
      const [userProfile, socialLinks] = await Promise.all([
        // Assume we have user profile API
        Promise.resolve(null), // Placeholder
        // Get social links
        Promise.resolve([]), // Placeholder
      ]);

      return {
        profile: userProfile,
        socialLinks: socialLinks,
      };
    },
    enabled: !!userId,
    ...cacheConfig.user,
  });
};

// Cache management tools
export const useCacheManager = () => {
  const queryClient = useQueryClient();

  return {
    // Clear all stale cache
    clearStaleCache: () => {
      queryClient.getQueryCache().getAll().forEach((query) => {
        if (query.isStale()) {
          queryClient.removeQueries({ queryKey: query.queryKey });
        }
      });
    },

    // Warm up core data
    warmupCache: () => {
      // Preload category list
      queryClient.prefetchQuery({
        queryKey: queryKeys.categoriesList(),
        queryFn: async () => {
          const { getCategoryList } = await import('../../services/categoryService');
          return getCategoryList();
        },
        staleTime: 30 * 60 * 1000,
      });
    },

    // Force refresh all queries
    refreshAll: () => {
      queryClient.invalidateQueries();
    },

    // Clear user-related cache (for logout)
    clearUserCache: () => {
      queryClient.removeQueries({ queryKey: queryKeys.user });
      queryClient.removeQueries({ queryKey: queryKeys.notifications });
    },
  };
};