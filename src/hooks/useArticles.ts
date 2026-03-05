import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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

interface UseArticlesOptions {
  autoRefresh?: boolean;
  initialState?: UseArticlesState;
}

export const useArticles = (
  initialParams: PageArticleParams = {},
  options: UseArticlesOptions = { autoRefresh: true }
) => {
  const defaultState: UseArticlesState = {
    articles: [],
    loading: options.autoRefresh !== false,
    error: null,
    hasMore: true,
    page: 1,
    total: 0,
  };

  const [state, setState] = useState<UseArticlesState>(
    options.initialState || defaultState
  );

  // Stabilize initialParams to prevent unnecessary callback recreation
  const stableParams = useMemo(
    () => initialParams,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(initialParams)]
  );

  // Request debouncing
  const requestTimeoutRef = useRef<NodeJS.Timeout>();
  // Ref to track loading state synchronously — avoids stale closure issues
  // where scroll handlers capture outdated `state.loading` values
  const loadingRef = useRef(false);

  const fetchArticles = useCallback(async (params: PageArticleParams = {}, append = false) => {
    // Clear any pending requests
    if (requestTimeoutRef.current) {
      clearTimeout(requestTimeoutRef.current);
    }

    const finalParams = {
      pageSize: 15, // Increased from 10 to 15 for better balance of performance and content
      ...stableParams,
      ...params,
      page: append ? (params.page || 1) : 1, // Use provided page number in append mode, otherwise start from page 1
    };

    loadingRef.current = true;
    setState(prev => ({ ...prev, loading: true, error: null }));

    // Debounce the request by 200ms
    requestTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await getPageArticles(finalParams);

        loadingRef.current = false;
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
        loadingRef.current = false;
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
  }, [stableParams]);

  const loadMore = useCallback(() => {
    if (!loadingRef.current && state.hasMore) {
      fetchArticles({ page: state.page + 1 }, true);
    }
  }, [state.hasMore, state.page, fetchArticles]);

  const refresh = useCallback(() => {
    fetchArticles({}, false);
  }, [fetchArticles]);

  useEffect(() => {
    if (options.autoRefresh) {
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
