import { useState, useEffect } from 'react';
import { getArticleDetail, trackArticleVisit } from '../services/articleService';
import { ArticleDetailResponse } from '../types/article';

interface UseArticleDetailState {
  article: ArticleDetailResponse | null;
  loading: boolean;
  error: string | null;
}

export const useArticleDetail = (uuid: string) => {
  const [state, setState] = useState<UseArticleDetailState>({
    article: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!uuid) {
      setState({
        article: null,
        loading: false,
        error: 'Article UUID is required',
      });
      return;
    }

    const fetchArticleDetail = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const article = await getArticleDetail(uuid);

        // Track visit after successfully fetching article details
        // This ensures authors' own visits are also counted
        trackArticleVisit(uuid).catch(error => {
          console.warn('⚠️ Visit tracking failed (non-critical):', error);
        });

        setState({
          article,
          loading: false,
          error: null,
        });

      } catch (error) {
        console.error('💥 Error fetching article detail:', error);
        setState({
          article: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch article detail',
        });
      }
    };

    fetchArticleDetail();
  }, [uuid]);

  const refetch = () => {
    if (uuid) {
      setState(prev => ({ ...prev, loading: true, error: null }));
      // Re-trigger the effect by setting a different state if needed
    }
  };

  return {
    ...state,
    refetch,
  };
};