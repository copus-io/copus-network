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
  const [sortBy, setSortBy] = useState<CommentSortBy>('newest');

  // 统一回复状态管理
  const [replyState, setReplyState] = useState<{
    isReplying: boolean;
    parentId?: string;
    replyToId?: string;
    replyToUser?: string;
  }>({
    isReplying: false
  });

  const commentFormRef = useRef<CommentFormRef>(null);

  // 处理回复按钮点击
  const handleReplyClick = (commentId: string, userName: string, grandParentId?: string) => {
    console.log('🔥🔥🔥 统一回复系统被调用!', { commentId, userName, grandParentId });

    // 📝 新的parentId逻辑：
    // - 回复1级评论：parentId = commentId (被回复的1级评论ID)
    // - 回复2级评论：parentId = commentId (被回复的2级评论ID)
    // 所以 parentId 始终等于当前被回复的评论ID

    // 判断是否是回复2级评论（用于replyToUser显示）
    const isReplyTo2ndLevel = !!grandParentId;

    const replyInfo = {
      parentId: commentId, // 新逻辑：始终指向当前被回复的评论
      replyToId: commentId, // 被回复的具体评论
      replyToUser: isReplyTo2ndLevel ? userName : undefined // 只有回复2级评论时才设置replyToUser
    };

    console.log('📝 新的Reply逻辑:', {
      isReplyTo2ndLevel,
      replyInfo,
      说明: isReplyTo2ndLevel ? '回复2级评论' : '回复1级评论',
      originalCommentId: commentId,
      originalUserName: userName,
      grandParentId: grandParentId
    });

    // 设置回复状态
    setReplyState({
      isReplying: true,
      ...replyInfo
    });

    // 聚焦到上方评论输入框
    if (commentFormRef.current) {
      commentFormRef.current.focusAndSetReply(replyInfo);
    }
  };

  // For articles, use optimized hook that prioritizes article detail API's commentCount
  const articleWithComments = useArticleWithComments(
    targetType === 'article' ? targetId : '',
    {
      sortBy,
      limit: 20,
      commentsEnabled: targetType === 'article'
    }
  );

  // For non-article types, use regular comments hook
  const { data: commentsData, isLoading: commentsLoading, error } = useComments(
    targetType,
    targetId,
    {
      sortBy,
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
    <div className={`w-full overflow-hidden min-h-[600px] ${className}`}>
      {/* Comment header with stats and sort options */}
      <div className="px-0 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="[font-family:'Lato',Helvetica] font-[450] text-[#231f20] text-2xl">
                Comments
              </span>
              <span className="[font-family:'Lato',Helvetica] text-base text-dark-grey">
                {totalComments} {totalComments === 1 ? 'comment' : 'comments'}
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as CommentSortBy)}
              className="pl-4 pr-10 py-2 border border-[#D3D3D3] rounded-full text-sm text-dark-grey bg-white transition-all [font-family:'Lato',Helvetica] hover:border-medium-grey appearance-none cursor-pointer"
              style={{
                outline: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23686868' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center'
              }}
            >
              <option value="newest">Newest</option>
              <option value="likes">Most liked</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
      </div>

      <div className="px-0 pt-4 pb-0">
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