import { useState, useEffect, useCallback, useRef } from 'react';
import { getPageArticles } from '../services/articleService';
import { Article, PageArticleParams } from '../types/article';

interface UseArticlesState {
  articles: Article[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  total: number;
}

export const useArticles = (
  initialParams: PageArticleParams = {},
  options: { autoRefresh?: boolean } = { autoRefresh: true }
) => {
  const [state, setState] = useState<UseArticlesState>({
    articles: [],
    loading: false,
    error: null,
    hasMore: true,
    page: 1,
    total: 0,
  });

  // Request debouncing and caching
  const requestTimeoutRef = useRef<NodeJS.Timeout>();
  const lastRequestRef = useRef<string>('');
  const cacheRef = useRef<Map<string, { data: Article[]; timestamp: number }>>(new Map());

  const fetchArticles = useCallback(async (params: PageArticleParams = {}, append = false) => {
    console.log('🔄 fetchArticles called:', { params, append, initialParams });

    // Clear any pending requests
    if (requestTimeoutRef.current) {
      clearTimeout(requestTimeoutRef.current);
    }

    const finalParams = {
      pageSize: 15, // Increased from 10 to 15 for better balance of performance and content
      ...initialParams,
      ...params,
      page: append ? (params.page || 1) : 1, // Use provided page number in append mode, otherwise start from page 1
    };

    const requestKey = JSON.stringify(finalParams);

    // Check cache first (5 minutes cache)
    const cached = cacheRef.current.get(requestKey);
    const now = Date.now();
    if (cached && (now - cached.timestamp < 5 * 60 * 1000) && !append) {
      console.log('📦 Using cached data for:', finalParams);
      setState(prev => ({
        ...prev,
        articles: cached.data,
        loading: false,
        hasMore: cached.data.length >= finalParams.pageSize,
        page: finalParams.page || 1,
        total: cached.data.length,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    // Debounce the request by 200ms
    requestTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('📡 About to call getPageArticles with:', finalParams);
        const response = await getPageArticles(finalParams);

        // Cache the result for non-append requests
        if (!append) {
          cacheRef.current.set(requestKey, {
            data: response.articles,
            timestamp: now
          });
        }

        setState(prev => {
          let mergedArticles;
          if (append) {
            // Deduplicate when merging, based on article.id
            const existingIds = new Set(prev.articles.map(article => article.id));
            const newArticles = response.articles.filter(article => !existingIds.has(article.id));
            mergedArticles = [...prev.articles, ...newArticles];
          } else {
            mergedArticles = response.articles;
          }

          return {
            ...prev,
            articles: mergedArticles,
            loading: false,
            hasMore: response.hasMore,
            page: response.page,
            total: response.total,
          };
        });
      } catch (error) {
        let errorMessage = 'Failed to fetch articles';

        if (error instanceof Error) {
          if (error.message.includes('System internal error')) {
            errorMessage = 'Backend service temporarily unavailable, please contact technical team to check service status';
          } else {
            errorMessage = error.message;
          }
        }

        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
      }
    }, 200); // 200ms debounce
  }, [initialParams]); // Add initialParams dependency

  const loadMore = useCallback(() => {
    if (!state.loading && state.hasMore) {
      fetchArticles({ page: state.page + 1 }, true);
    }
  }, [state.loading, state.hasMore, state.page, fetchArticles]);

  const refresh = useCallback(() => {
    // Clear cache so refresh actually fetches fresh data
    cacheRef.current.clear();
    fetchArticles({}, false);
  }, [fetchArticles]);

  useEffect(() => {
    if (options.autoRefresh) {
      // Always clear cache on mount to ensure fresh data when navigating back
      cacheRef.current.clear();
      fetchArticles();
    }
  }, []); // Only execute on component first render

  return {
    ...state,
    fetchArticles,
    loadMore,
    refresh,
  };
};