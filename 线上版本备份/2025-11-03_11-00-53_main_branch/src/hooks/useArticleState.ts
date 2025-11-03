import { useState, useCallback, useEffect } from 'react';
import { AuthService } from '../services/authService';

const ARTICLE_STATES_KEY = 'copus_article_states';

// 从localStorage读取状态
const loadArticleStates = (): Record<string, { isLiked: boolean; likeCount: number }> => {
  try {
    const saved = localStorage.getItem(ARTICLE_STATES_KEY);
    const states = saved ? JSON.parse(saved) : {};
    const stateCount = Object.keys(states).length;
    return states;
  } catch (error) {
    console.error('❌ 加载文章状态失败:', error);
    return {};
  }
};

// 保存状态到localStorage
const saveArticleStates = (states: Record<string, { isLiked: boolean; likeCount: number }>) => {
  try {
    const stateCount = Object.keys(states).length;
    localStorage.setItem(ARTICLE_STATES_KEY, JSON.stringify(states));
  } catch (error) {
    console.error('❌ 保存文章状态失败:', error);
  }
};

// 文章状态管理hook
export const useArticleState = (showToast?: (message: string, type: 'success' | 'error') => void) => {

  // 全局文章点赞状态缓存 - 从localStorage初始化
  const [articleLikeStates, setArticleLikeStates] = useState<Record<string, {
    isLiked: boolean;
    likeCount: number;
  }>>(loadArticleStates);

  // 更新文章点赞状态
  const updateArticleLikeState = useCallback((articleId: string, isLiked: boolean, likeCount: number) => {
    setArticleLikeStates(prev => {
      const newStates = {
        ...prev,
        [articleId]: { isLiked, likeCount }
      };
      // 保存到localStorage
      saveArticleStates(newStates);
      return newStates;
    });
  }, []);

  // 获取文章点赞状态
  const getArticleLikeState = useCallback((articleId: string, defaultIsLiked: boolean, defaultLikeCount: number) => {
    return articleLikeStates[articleId] || { isLiked: defaultIsLiked, likeCount: defaultLikeCount };
  }, [articleLikeStates]);

  // 切换点赞状态的通用函数
  const toggleLike = useCallback(async (
    articleId: string,
    currentIsLiked: boolean,
    currentLikeCount: number,
    onOptimisticUpdate?: (isLiked: boolean, likeCount: number) => void
  ) => {
    try {
      const newIsLiked = !currentIsLiked;
      const newLikeCount = newIsLiked ? currentLikeCount + 1 : Math.max(0, currentLikeCount - 1);


      // 立即更新全局状态（乐观更新）
      updateArticleLikeState(articleId, newIsLiked, newLikeCount);

      // 如果提供了本地更新回调，也执行它
      onOptimisticUpdate?.(newIsLiked, newLikeCount);

      // 调用API
      const apiResponse = await AuthService.likeArticle(articleId);

      showToast?.(newIsLiked ? '已点赞 💖' : '已取消点赞', 'success');

      return { success: true, isLiked: newIsLiked, likeCount: newLikeCount };
    } catch (error) {
      console.error('❌ 点赞失败:', error);

      // API失败时回滚全局状态
      updateArticleLikeState(articleId, currentIsLiked, currentLikeCount);

      // 如果提供了本地更新回调，也回滚它
      onOptimisticUpdate?.(currentIsLiked, currentLikeCount);

      showToast?.('操作失败，请重试', 'error');

      return { success: false, isLiked: currentIsLiked, likeCount: currentLikeCount };
    }
  }, [updateArticleLikeState, showToast]);

  // 批量同步文章状态（从API数据初始化）
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
          // 只在状态不同时才更新，避免不必要的localStorage写入
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
      } else {
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