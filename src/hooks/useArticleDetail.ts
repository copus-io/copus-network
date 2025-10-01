import { useState, useEffect } from 'react';
import { getArticleDetail } from '../services/articleService';
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
        console.log('🚀 Fetching article detail for:', uuid);
        const article = await getArticleDetail(uuid);

        console.log('📋 API返回的原始数据:', article);
        console.log('🖼️ 封面图URL:', article?.coverUrl);
        console.log('📝 内容描述:', article?.content);
        console.log('👤 作者信息:', article?.authorInfo);
        console.log('🏷️ 分类信息:', article?.categoryInfo);

        setState({
          article,
          loading: false,
          error: null,
        });

        console.log('✨ Article detail loaded successfully!');
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