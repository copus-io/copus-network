// Combined hook for article detail and comment count optimization

import { useArticleDetail } from './useArticleDetail';
import { useOptimizedComments } from './useComments';
import { CommentSortBy } from '../../types/comment';

interface UseArticleWithCommentsOptions {
  sortBy?: CommentSortBy;
  limit?: number;
  commentsEnabled?: boolean; // Allow disabling comment fetching if only count needed
}

interface ArticleWithCommentsData {
  // Article data
  article?: {
    id: number;
    title: string;
    content: string;
    commentCount: number;
    // Add other fields as needed
  };

  // Comments data
  comments?: Array<any>;
  totalComments: number;
  hasMoreComments?: boolean;

  // Loading states
  isArticleLoading: boolean;
  isCommentsLoading: boolean;
  isLoading: boolean;

  // Error states
  articleError?: Error;
  commentsError?: Error;
  hasError: boolean;
}

/**
 * Combined hook to fetch article details and comments efficiently
 * Prioritizes article detail API's commentCount over comments API's totalCount
 */
export const useArticleWithComments = (
  articleUuid: string,
  options: UseArticleWithCommentsOptions = {}
): ArticleWithCommentsData => {
  const {
    sortBy = 'newest',
    limit = 20,
    commentsEnabled = true
  } = options;

  // Fetch article detail (contains commentCount)
  const {
    data: articleDetail,
    isLoading: isArticleLoading,
    error: articleError
  } = useArticleDetail(articleUuid, { forceRefresh: false });

  // 🔍 Debug: Check article detail data
  console.log('🔍 Article Detail Data:', {
    articleUuid,
    articleDetail,
    articleId: articleDetail?.id,
    commentCount: articleDetail?.commentCount
  });

  // Fetch comments list with optimized loading (only if enabled)
  // Note: Use direct query key naming to match the invalidation logic in useCreateComment
  const {
    data: commentsData,
    isLoading: isCommentsLoading,
    error: commentsError
  } = useOptimizedComments('article', articleDetail?.id?.toString() || '', {
    sortBy,
    limit,
    enabled: commentsEnabled && !!articleDetail?.id
  });

  // Determine total comments with priority: article.commentCount > comments.totalCount
  const totalComments = articleDetail?.commentCount !== undefined
    ? articleDetail.commentCount
    : (commentsData?.totalCount || 0);

  const isLoading = isArticleLoading || (commentsEnabled && isCommentsLoading);
  const hasError = !!articleError || !!(commentsEnabled && commentsError);

  return {
    // Article data
    article: articleDetail ? {
      id: articleDetail.id,
      title: articleDetail.title,
      content: articleDetail.content,
      commentCount: articleDetail.commentCount || 0
    } : undefined,

    // Comments data
    comments: commentsData?.comments,
    totalComments,
    hasMoreComments: commentsData?.hasMore,

    // Loading states
    isArticleLoading,
    isCommentsLoading: commentsEnabled ? isCommentsLoading : false,
    isLoading,

    // Error states
    articleError,
    commentsError: commentsEnabled ? commentsError : undefined,
    hasError
  };
};

/**
 * Lightweight hook to get just article comment count (no comments list)
 * Useful for displaying comment count without fetching full comment list
 */
export const useArticleCommentCount = (articleUuid: string) => {
  const {
    totalComments,
    isArticleLoading,
    articleError
  } = useArticleWithComments(articleUuid, {
    commentsEnabled: false
  });

  return {
    commentCount: totalComments,
    isLoading: isArticleLoading,
    error: articleError
  };
};