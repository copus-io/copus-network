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
        page: append ? (params.page || 1) : 1, // 如果是追加模式使用传入的页码，否则从第1页开始
        pageSize: 10, // 优化加载性能，提升用户体验
        ...initialParams,
        ...params,
      };

      console.log('📄 获取文章数据，参数:', finalParams);
      const response = await getPageArticles(finalParams);

      // Debug article data, especially image URLs
      response.articles.forEach((article, index) => {
        console.log(`Article ${index}:`, {
          id: article.id,
          title: article.title,
          userName: article.userName,
          date: article.date,
          coverImage: article.coverImage,
          hasImage: !!article.coverImage && article.coverImage.trim() !== ''
        });
      });

      setState(prev => ({
        ...prev,
        articles: append ? [...prev.articles, ...response.articles] : response.articles,
        loading: false,
        hasMore: response.hasMore,
        page: response.page,
        total: response.total,
      }));
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
  }, []); // Remove dependency on initialParams

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