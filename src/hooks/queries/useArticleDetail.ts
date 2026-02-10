// React hook for article detail with TanStack Query integration

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getArticleDetail,
  GetArticleDetailOptions,
  clearArticleDetailCache,
  preloadArticleDetail,
  getArticleIdByUuid
} from '../../services/articleService';
import { ArticleDetailResponse } from '../../types/article';

/**
 * Hook to fetch article detail with caching and error handling
 */
export const useArticleDetail = (
  uuid: string,
  options: GetArticleDetailOptions = {}
) => {
  const queryClient = useQueryClient();

  return useQuery<ArticleDetailResponse, Error>({
    queryKey: ['articleDetail', uuid],
    queryFn: () => getArticleDetail(uuid, options),
    staleTime: 10 * 60 * 1000, // 10 minutes - matches service cache
    cacheTime: 20 * 60 * 1000, // 20 minutes
    retry: false, // Disable React Query retry since we handle it in the service
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: !!uuid
  });
};

/**
 * Hook to get article ID by UUID (optimized for frequent calls)
 */
export const useArticleId = (uuid: string) => {
  return useQuery<number, Error>({
    queryKey: ['articleId', uuid],
    queryFn: () => getArticleIdByUuid(uuid),
    staleTime: 15 * 60 * 1000, // 15 minutes - longer cache for ID-only queries
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!uuid
  });
};

/**
 * Hook to preload article details
 */
export const usePreloadArticleDetail = () => {
  const queryClient = useQueryClient();

  const preloadDetail = (uuid: string) => {
    queryClient.prefetchQuery({
      queryKey: ['articleDetail', uuid],
      queryFn: () => getArticleDetail(uuid, { forceRefresh: false }),
      staleTime: 10 * 60 * 1000
    });
  };

  return { preloadDetail };
};

/**
 * Hook for article detail actions (refresh, clear cache, etc.)
 */
export const useArticleDetailActions = () => {
  const queryClient = useQueryClient();

  const refreshArticleDetail = (uuid: string) => {
    // Clear both service cache and React Query cache
    clearArticleDetailCache(uuid);
    queryClient.invalidateQueries({ queryKey: ['articleDetail', uuid] });
    queryClient.invalidateQueries({ queryKey: ['articleId', uuid] });
  };

  const clearAllArticleCache = () => {
    // Clear all article detail queries
    queryClient.removeQueries({ queryKey: ['articleDetail'] });
    queryClient.removeQueries({ queryKey: ['articleId'] });
    // Clear service cache
    clearArticleDetailCache();
  };

  const bustCacheAndRefresh = async (uuid: string) => {
    // Clear internal service cache
    clearArticleDetailCache(uuid);
    // Invalidate queries to trigger refetch while keeping existing data visible
    await queryClient.invalidateQueries({
      queryKey: ['article', 'detail', uuid],
      refetchType: 'active'
    });
    // Also invalidate legacy query keys
    queryClient.invalidateQueries({ queryKey: ['articleDetail', uuid] });
    queryClient.invalidateQueries({ queryKey: ['articleId', uuid] });
  };

  return {
    refreshArticleDetail,
    clearAllArticleCache,
    bustCacheAndRefresh
  };
};

/**
 * Hook for batch preloading article details
 */
export const useBatchPreloadArticles = () => {
  const queryClient = useQueryClient();

  const preloadArticles = async (uuids: string[]) => {
    const promises = uuids.map(uuid =>
      queryClient.prefetchQuery({
        queryKey: ['articleDetail', uuid],
        queryFn: () => preloadArticleDetail(uuid),
        staleTime: 10 * 60 * 1000
      })
    );

    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.debug('Some article preloads failed:', error);
    }
  };

  return { preloadArticles };
};