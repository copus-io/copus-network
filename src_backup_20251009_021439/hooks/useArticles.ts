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

export const useArticles = (initialParams: PageArticleParams = {}) => {
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
      const response = await getPageArticles({
        page: 1,
        pageSize: 20,
        ...initialParams,
        ...params,
      });

      // 调试文章数据，特别是图片URL
      console.log('📚 Articles fetched:', response.articles.length);
      console.log('📋 完整的文章列表API响应:', response);
      response.articles.forEach((article, index) => {
        console.log(`📄 Article ${index + 1}:`, {
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
        if (error.message.includes('系统内部错误')) {
          errorMessage = '后端服务暂时不可用，请联系技术团队检查服务状态';
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
  }, []); // 移除对initialParams的依赖

  const loadMore = useCallback(() => {
    if (!state.loading && state.hasMore) {
      fetchArticles({ page: state.page + 1 }, true);
    }
  }, [state.loading, state.hasMore, state.page, fetchArticles]);

  const refresh = useCallback(() => {
    fetchArticles({}, false);
  }, [fetchArticles]);

  useEffect(() => {
    fetchArticles();
  }, []); // 只在组件首次渲染时执行

  return {
    ...state,
    fetchArticles,
    loadMore,
    refresh,
  };
};