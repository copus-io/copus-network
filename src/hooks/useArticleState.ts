import { useState, useCallback, useEffect } from 'react';
import { AuthService } from '../services/authService';

const ARTICLE_STATES_KEY = 'copus_article_states';

// Load states from localStorage
const loadArticleStates = (): Record<string, { isLiked: boolean; likeCount: number }> => {
  try {
    const saved = localStorage.getItem(ARTICLE_STATES_KEY);
    const states = saved ? JSON.parse(saved) : {};
    const stateCount = Object.keys(states).length;
    return states;
  } catch (error) {
    console.error('❌ Failed to load article states:', error);
    return {};
  }
};

// Save states to localStorage
const saveArticleStates = (states: Record<string, { isLiked: boolean; likeCount: number }>) => {
  try {
    const stateCount = Object.keys(states).length;
    localStorage.setItem(ARTICLE_STATES_KEY, JSON.stringify(states));
  } catch (error) {
    console.error('❌ Failed to save article states:', error);
  }
};

// Article state management hook
export const useArticleState = (
  showToast?: (message: string, type: 'success' | 'error') => void,
  isUserLoggedIn?: boolean
) => {

  // Global article like state cache - initialized from localStorage
  const [articleLikeStates, setArticleLikeStates] = useState<Record<string, {
    isLiked: boolean;
    likeCount: number;
  }>>(loadArticleStates);

  // Update article like state
  const updateArticleLikeState = useCallback((articleId: string, isLiked: boolean, likeCount: number) => {
    setArticleLikeStates(prev => {
      const newStates = {
        ...prev,
        [articleId]: { isLiked, likeCount }
      };
      // Save to localStorage
      saveArticleStates(newStates);
      return newStates;
    });
  }, []);

  // Get article like state
  const getArticleLikeState = useCallback((articleId: string, defaultIsLiked: boolean, defaultLikeCount: number) => {
    // If user is not logged in, directly use default values (API data), don't use cached global state
    if (!isUserLoggedIn) {
      return { isLiked: defaultIsLiked, likeCount: defaultLikeCount };
    }

    // When user is logged in, use global state or default values
    return articleLikeStates[articleId] || { isLiked: defaultIsLiked, likeCount: defaultLikeCount };
  }, [articleLikeStates, isUserLoggedIn]);

  // Toggle like state function
  const toggleLike = useCallback(async (
    articleId: string,
    currentIsLiked: boolean,
    currentLikeCount: number,
    onOptimisticUpdate?: (isLiked: boolean, likeCount: number) => void
  ) => {
    try {
      const newIsLiked = !currentIsLiked;
      const newLikeCount = newIsLiked ? currentLikeCount + 1 : Math.max(0, currentLikeCount - 1);


      // Immediately update global state (optimistic update)
      updateArticleLikeState(articleId, newIsLiked, newLikeCount);

      // If local update callback is provided, execute it
      onOptimisticUpdate?.(newIsLiked, newLikeCount);

      // Call API
      const apiResponse = await AuthService.likeArticle(articleId);

      showToast?.(newIsLiked ? 'Liked 💖' : 'Unliked', 'success');

      return { success: true, isLiked: newIsLiked, likeCount: newLikeCount };
    } catch (error) {
      console.error('❌ Like operation failed:', error);

      // Rollback global state when API fails
      updateArticleLikeState(articleId, currentIsLiked, currentLikeCount);

      // If local update callback is provided, rollback it too
      onOptimisticUpdate?.(currentIsLiked, currentLikeCount);

      showToast?.('Operation failed, please try again', 'error');

      return { success: false, isLiked: currentIsLiked, likeCount: currentLikeCount };
    }
  }, [updateArticleLikeState, showToast]);

  // Batch sync article states (initialize from API data)
  const syncArticleStates = useCallback((articles: Array<{
    id: string;
    uuid?: string;
    isLiked: boolean;
    likeCount: number;
  }>) => {

    setArticleLikeStates(prev => {
      const newStates = { ...prev };
      let hasChanges = false;
      let updatedCount = 0;

      articles.forEach(article => {
        const articleId = article.uuid || article.id;
        if (articleId) {
          // Only update when state is different, avoid unnecessary localStorage writes
          const currentState = prev[articleId];
          if (!currentState ||
              currentState.isLiked !== article.isLiked ||
              currentState.likeCount !== article.likeCount) {
            newStates[articleId] = {
              isLiked: article.isLiked,
              likeCount: article.likeCount
            };
            hasChanges = true;
            updatedCount++;
          }
        }
      });

      if (hasChanges) {
        saveArticleStates(newStates);
      }

      return newStates;
    });
  }, []);

  return {
    articleLikeStates,
    updateArticleLikeState,
    getArticleLikeState,
    toggleLike,
    syncArticleStates
  };
};