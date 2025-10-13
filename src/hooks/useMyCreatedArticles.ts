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
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchMyCreatedArticles = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const articles = await getMyCreatedArticles(params);


        setState({
          articles,
          loading: false,
          error: null,
        });

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
  }, [JSON.stringify(params), refreshKey]);

  const refetch = () => {
    setRefreshKey(prev => prev + 1);
  };

  return {
    ...state,
    refetch,
  };
};