// Main comment section component - NetEase Cloud Music style

import React, { useState, useRef } from 'react';
import { useComments } from '../../hooks/queries/useComments';
import { useArticleWithComments } from '../../hooks/queries/useArticleWithComments';
import { CommentSortBy } from '../../types/comment';
import { CommentForm, CommentFormRef } from './CommentForm';
import { CommentList } from './CommentList';
import { CommentSkeleton } from './CommentSkeleton';

interface CommentSectionProps {
  targetType: 'article' | 'treasury' | 'user' | 'space';
  targetId: string;
  className?: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  targetType,
  targetId,
  className = ''
}) => {
  // const [sortBy, setSortBy] = useState<CommentSortBy>('newest'); // Temporarily disabled - no backend support

  // Unified reply state management
  const [replyState, setReplyState] = useState<{
    isReplying: boolean;
    parentId?: string;
    replyToId?: string;
    replyToUser?: string;
  }>({
    isReplying: false
  });

  const commentFormRef = useRef<CommentFormRef>(null);

  // Handle reply button click
  const handleReplyClick = (commentId: string, userName: string, grandParentId?: string) => {
    console.log('🔥🔥🔥 Unified reply system called!', { commentId, userName, grandParentId });

    // 📝 New parentId logic:
    // - Reply to 1st level comment: parentId = commentId (replied 1st level comment ID)
    // - Reply to 2nd level comment: parentId = commentId (replied 2nd level comment ID)
    // So parentId always equals the current replied comment ID

    // Determine if replying to 2nd level comment (for replyToUser display)
    const isReplyTo2ndLevel = !!grandParentId;

    const replyInfo = {
      parentId: commentId, // New logic: always points to the currently replied comment
      replyToId: commentId, // The specific comment being replied to
      replyToUser: isReplyTo2ndLevel ? userName : undefined // Only set replyToUser when replying to 2nd level comments
    };

    console.log('📝 New Reply logic:', {
      isReplyTo2ndLevel,
      replyInfo,
      description: isReplyTo2ndLevel ? 'Reply to 2nd level comment' : 'Reply to 1st level comment',
      originalCommentId: commentId,
      originalUserName: userName,
      grandParentId: grandParentId
    });

    // Set reply state
    setReplyState({
      isReplying: true,
      ...replyInfo
    });

    // Focus on comment input box above
    if (commentFormRef.current) {
      commentFormRef.current.focusAndSetReply(replyInfo);
    }
  };

  // For articles, use optimized hook that prioritizes article detail API's commentCount
  const articleWithComments = useArticleWithComments(
    targetType === 'article' ? targetId : '',
    {
      // sortBy, // Disabled - no backend support
      limit: 20,
      commentsEnabled: targetType === 'article'
    }
  );

  // For non-article types, use regular comments hook
  const { data: commentsData, isLoading: commentsLoading, error } = useComments(
    targetType,
    targetId,
    {
      // sortBy, // Disabled - no backend support
      limit: 20,
      enabled: targetType !== 'article' // Only enabled for non-article types
    }
  );

  // Use optimized data for articles, fallback to regular comments for other types
  const totalComments = targetType === 'article'
    ? articleWithComments.totalComments
    : (commentsData?.totalCount || 0);

  const comments = targetType === 'article'
    ? articleWithComments.comments
    : commentsData?.comments;

  const hasMore = targetType === 'article'
    ? articleWithComments.hasMoreComments
    : commentsData?.hasMore;

  const isLoading = targetType === 'article'
    ? articleWithComments.isLoading
    : commentsLoading;

  // 🔍 Debug: Log comment data loading
  console.log('🔍 CommentSection Debug:', {
    targetType,
    targetId,
    totalComments,
    comments: comments?.length || 0,
    isLoading,
    hasMore,
    articleWithComments: targetType === 'article' ? {
      totalComments: articleWithComments.totalComments,
      comments: articleWithComments.comments?.length,
      isLoading: articleWithComments.isLoading,
      error: articleWithComments.hasError
    } : null,
    regularCommentsData: targetType !== 'article' ? {
      totalCount: commentsData?.totalCount,
      comments: commentsData?.comments?.length,
      isLoading: commentsLoading,
      error: !!error
    } : null
  });


  return (
    <div className={`w-full overflow-hidden ${className}`}>
      {/* Simplified layout - header info is handled by parent component */}
      <div className="px-0 pt-0 pb-0">
        {/* Comment form */}
        <CommentForm
          ref={commentFormRef}
          targetType={targetType}
          targetId={targetId}
          articleId={targetType === 'article' ? articleWithComments.article?.id?.toString() : undefined}
          replyState={replyState}
          onReplyComplete={() => setReplyState({ isReplying: false })}
        />

        {/* Comment list */}
        <div className="mt-6">
          {isLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 3 }, (_, i) => (
                <CommentSkeleton key={i} />
              ))}
            </div>
          ) : (
            <CommentList
              comments={comments || []}
              targetType={targetType}
              targetId={targetId}
              hasMore={hasMore || false}
              totalCount={totalComments}
              articleId={targetType === 'article' ? articleWithComments.article?.id?.toString() : undefined}
              onReplyClick={handleReplyClick}
            />
          )}
        </div>
      </div>
    </div>
  );
};