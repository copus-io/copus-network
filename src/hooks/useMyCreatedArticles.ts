import { useState, useEffect } from 'react';
import { getMyCreatedArticles } from '../services/articleService';
import { MyCreatedArticleResponse, MyCreatedArticleParams } from '../types/article';

interface UseMyCreatedArticlesState {
  articles: MyCreatedArticleResponse | null;
  loading: boolean;
  error: string | null;
}

export const useMyCreatedArticles = (params: MyCreatedArticleParams = {}) => {
  const [state, setState] = useState<UseMyCreatedArticlesState>({
    articles: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    const fetchMyCreatedArticles = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        console.log('🚀 Fetching my created articles with params:', params);
        const articles = await getMyCreatedArticles(params);

        console.log('📋 API返回的我的创作数据:', articles);
        console.log('📝 文章数量:', articles.data.length);

        setState({
          articles,
          loading: false,
          error: null,
        });

        console.log('✨ My created articles loaded successfully!');
      } catch (error) {
        console.error('💥 Error fetching my created articles:', error);
        setState({
          articles: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch my created articles',
        });
      }
    };

    fetchMyCreatedArticles();
  }, [JSON.stringify(params)]);

  const refetch = () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    // Re-trigger the effect by updating params if needed
  };

  return {
    ...state,
    refetch,
  };
};