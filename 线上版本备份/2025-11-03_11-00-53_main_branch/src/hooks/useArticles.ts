import { useState, useEffect, useCallback } from 'react';
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

  const fetchArticles = useCallback(async (params: PageArticleParams = {}, append = false) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const finalParams = {
        pageSize: 10, // Optimize loading performance for better UX
        ...initialParams,
        ...params,
        page: append ? (params.page || 1) : 1, // Use provided page number in append mode, otherwise start from page 1
      };

      const response = await getPageArticles(finalParams);


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
  }, [initialParams]); // Add initialParams dependency

  const loadMore = useCallback(() => {
    if (!state.loading && state.hasMore) {
      fetchArticles({ page: state.page + 1 }, true);
    }
  }, [state.loading, state.hasMore, state.page, fetchArticles]);

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