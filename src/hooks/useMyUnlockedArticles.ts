import { useState, useEffect } from 'react';
import { getMyUnlockedArticles } from '../services/articleService';
import { MyUnlockedArticleResponse, MyUnlockedArticleParams } from '../types/article';

interface UseMyUnlockedArticlesState {
  articles: MyUnlockedArticleResponse | null;
  loading: boolean;
  error: string | null;
}

export const useMyUnlockedArticles = (params: MyUnlockedArticleParams) => {
  const [state, setState] = useState<UseMyUnlockedArticlesState>({
    articles: null,
    loading: false,
    error: null,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchMyUnlockedArticles = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const articles = await getMyUnlockedArticles(params);

        setState({
          articles,
          loading: false,
          error: null,
        });

      } catch (error) {
        console.error('💥 Error fetching my unlocked articles:', error);
        setState({
          articles: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch my unlocked articles',
        });
      }
    };

    fetchMyUnlockedArticles();
  }, [JSON.stringify(params), refreshKey]);

  const refetch = () => {
    setRefreshKey(prev => prev + 1);
  };

  return {
    ...state,
    refetch,
  };
};