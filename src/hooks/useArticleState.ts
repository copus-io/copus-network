import { useState, useCallback } from 'react';
import { AuthService } from '../services/authService';

// 文章状态管理hook
export const useArticleState = (showToast?: (message: string, type: 'success' | 'error') => void) => {

  // 全局文章点赞状态缓存
  const [articleLikeStates, setArticleLikeStates] = useState<Record<string, {
    isLiked: boolean;
    likeCount: number;
  }>>({});

  // 更新文章点赞状态
  const updateArticleLikeState = useCallback((articleId: string, isLiked: boolean, likeCount: number) => {
    setArticleLikeStates(prev => ({
      ...prev,
      [articleId]: { isLiked, likeCount }
    }));
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
      console.log('💖 正在点赞文章:', articleId);
      await AuthService.likeArticle(articleId);

      showToast?.(newIsLiked ? '已点赞 💖' : '已取消点赞', 'success');
      console.log('✅ 点赞成功');

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

  return {
    articleLikeStates,
    updateArticleLikeState,
    getArticleLikeState,
    toggleLike
  };
};