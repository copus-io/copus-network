import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/components/ui/toast';
import { useArticleDetail } from '@/hooks/queries';
import { apiRequest } from '@/services/api';
import { SpaceData } from '@/components/ui/TreasuryCard';
import { debugLog } from '@/utils/debugLogger';

/**
 * 🎯 PURPOSE: Centralized state management for Content page
 * 🔗 CONTEXT: Manages article state, like state, and user spaces
 * 🛠️ USED_IN: Content.tsx
 */
export const useContentState = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, getArticleLikeState, updateArticleLikeState } = useUser();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Article data and loading state
  const { article, loading, error, refetch: refetchArticle } = useArticleDetail(id || '');

  // Like state management
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // User spaces for hover card
  const [userSpaces, setUserSpaces] = useState<SpaceData[]>([]);

  // 🔍 SEARCH: content-state-effects
  // Initialize like state when article loads
  useEffect(() => {
    if (article && user) {
      const likeState = getArticleLikeState(article.id.toString());
      setIsLiked(likeState);
      setLikesCount(article.likeCount || 0);

      debugLog.ui('Content state initialized:', {
        articleId: article.id,
        isLiked: likeState,
        likesCount: article.likeCount
      });
    }
  }, [article, user, getArticleLikeState]);

  // Fetch user spaces when article loads
  useEffect(() => {
    const fetchUserSpaces = async () => {
      if (!article?.user?.id) return;

      try {
        debugLog.api('Fetching user spaces for user:', article.user.id);

        const response: any = await apiRequest(`/client/user/pageMySpaces?userId=${article.user.id}&pageIndex=1&pageSize=10`, {
          method: 'GET',
          requiresAuth: false,
        });

        if (response?.data && Array.isArray(response.data)) {
          const spaces = response.data.map((space: any) => ({
            id: space.id,
            namespace: space.namespace,
            spaceName: space.spaceName,
            spaceDescription: space.spaceDescription,
            articleCount: space.articleCount || 0,
            spaceCreatorName: space.spaceCreatorName,
            spaceCreatorNamespace: space.spaceCreatorNamespace,
            profileFaceUrl: space.profileFaceUrl,
          }));

          setUserSpaces(spaces);
          debugLog.api('User spaces loaded:', spaces.length);
        }
      } catch (err) {
        debugLog.error('Failed to fetch user spaces:', err);
        setUserSpaces([]);
      }
    };

    fetchUserSpaces();
  }, [article?.user?.id]);

  // Show success toast when arriving from browser extension
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('published') === 'true') {
      showToast('Done! You just surfaced an internet gem!', 'success');
      // Remove the query param from URL without reload
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [location.search, showToast]);

  // 🔍 SEARCH: content-state-handlers
  const handleLikeChange = useCallback((newIsLiked: boolean, newCount: number) => {
    setIsLiked(newIsLiked);
    setLikesCount(newCount);

    if (article) {
      updateArticleLikeState(article.id.toString(), newIsLiked);
      debugLog.ui('Like state updated:', {
        articleId: article.id,
        isLiked: newIsLiked,
        count: newCount
      });
    }
  }, [article, updateArticleLikeState]);

  const handleRefetch = useCallback(async () => {
    try {
      debugLog.ui('Refetching article data...');
      await refetchArticle();

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['optimizedComments'] });
      queryClient.invalidateQueries({ queryKey: ['articleWithComments'] });

      debugLog.ui('Article data refetched successfully');
    } catch (error) {
      debugLog.error('Failed to refetch article:', error);
    }
  }, [refetchArticle, queryClient]);

  // Loading and error states
  if (loading) {
    return {
      loading: true,
      error: null,
      article: null,
      isLiked: false,
      likesCount: 0,
      userSpaces: [],
      handleLikeChange: () => {},
      handleRefetch: () => {},
    };
  }

  if (error || !article) {
    return {
      loading: false,
      error: error || new Error('Article not found'),
      article: null,
      isLiked: false,
      likesCount: 0,
      userSpaces: [],
      handleLikeChange: () => {},
      handleRefetch: () => {},
    };
  }

  return {
    loading: false,
    error: null,
    article,
    isLiked,
    likesCount,
    userSpaces,
    handleLikeChange,
    handleRefetch,
  };
};

export type ContentStateReturn = ReturnType<typeof useContentState>;