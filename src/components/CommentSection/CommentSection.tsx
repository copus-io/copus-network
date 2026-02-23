// Main comment section component - NetEase Cloud Music style

import React, { useState, useRef } from 'react';
import { useComments } from '../../hooks/queries/useComments';
import { useArticleWithComments } from '../../hooks/queries/useArticleWithComments';
import { CommentSortBy } from '../../types/comment';
import { CommentForm, CommentFormRef } from './CommentForm';
import { CommentList } from './CommentList';
import { CommentSkeleton } from './CommentSkeleton';
import { ReplyModal } from './ReplyModal';

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

  // Unified reply state management - 弹窗模式
  const [replyState, setReplyState] = useState<{
    isReplying: boolean;
    parentId?: string;
    replyToId?: string;
    replyToUser?: string;
    targetComment?: any; // 被回复的评论数据
  }>({
    isReplying: false
  });

  const commentFormRef = useRef<CommentFormRef>(null);

  // 获取所有评论（这里只能获取顶级评论，2级回复通过其他方式处理）
  const getAllComments = () => {
    return comments || [];
  };

  // Handle reply button click - 弹窗模式
  const handleReplyClick = (commentId: string, userName: string, grandParentId?: string) => {
    console.log('🎯 弹窗回复启动!', { commentId, userName, grandParentId });
    console.log('📝 所有评论数据:', comments?.length, '条评论');

    // 确定回复逻辑
    const isReplyTo2ndLevel = !!grandParentId;

    // 在所有评论（包括回复）中找到被回复的评论
    const allComments = getAllComments();
    console.log('🔍 搜索评论ID:', commentId, '在', allComments.length, '条评论中');
    console.log('📋 所有评论ID列表:', allComments.map(c => c.id));

    const targetComment = allComments.find(comment => comment.id === commentId);

    // 如果在主评论中找不到，可能是2级回复，创建一个临时的目标评论对象
    if (!targetComment) {
      console.log('⚠️ 评论不在主列表中（可能是2级回复），创建临时对象:', commentId);

      // 对于2级回复，我们知道有grandParentId，所以这是有效的回复
      if (grandParentId) {
        // 创建一个临时的评论对象用于显示
        const tempTargetComment = {
          id: commentId,
          authorName: userName,
          authorAvatar: null,
          content: 'Reply comment', // Temporary content for display
          createdAt: new Date().toISOString(),
          isLiked: false,
          likesCount: 0,
          canDelete: false,
          authorId: '',
          authorNamespace: '',
          depth: 1,
          parentId: grandParentId,
          repliesCount: 0,
          images: []
        };

        console.log('✅ 创建临时目标评论:', { id: tempTargetComment.id, content: tempTargetComment.content });

        const replyInfo = {
          parentId: grandParentId, // 2级回复使用grandParentId作为parentId
          replyToId: commentId, // 实际回复的评论ID
          replyToUser: userName, // 显示被回复用户的名字
          targetComment: tempTargetComment // 使用临时评论对象
        };

        console.log('🔍 2级回复信息:', replyInfo);

        setReplyState({
          isReplying: true,
          ...replyInfo
        });
        return;
      } else {
        console.error('❌ 无法找到被回复的评论，且不是2级回复:', commentId);
        console.error('📊 可用的评论ID:', allComments.map(c => ({ id: c.id, content: c.content.substring(0, 20) })));
        return;
      }
    }

    console.log('✅ 找到目标评论:', { id: targetComment.id, content: targetComment.content.substring(0, 30) });

    const replyInfo = {
      parentId: isReplyTo2ndLevel ? grandParentId : commentId, // 2级回复时使用grandParentId作为parentId
      replyToId: commentId, // 实际回复的评论ID
      replyToUser: userName, // 始终显示被回复用户的名字
      targetComment // 被回复的评论完整数据
    };

    console.log('🔍 Reply info details:', {
      isReplyTo2ndLevel,
      parentId: replyInfo.parentId,
      replyToId: replyInfo.replyToId,
      replyToUser: replyInfo.replyToUser,
      targetComment: targetComment.content.substring(0, 50) + '...'
    });

    // 设置回复状态，触发弹窗显示
    setReplyState({
      isReplying: true,
      ...replyInfo
    });
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
        {/* Comment form - 始终显示主评论输入框 */}
        <div className="comment-form-container px-3 sm:px-0">
          <CommentForm
            ref={commentFormRef}
            targetType={targetType}
            targetId={targetId}
            articleId={targetType === 'article' ? articleWithComments.article?.id?.toString() : undefined}
            replyState={{ isReplying: false }}
            onReplyComplete={() => setReplyState({ isReplying: false })}
          />
        </div>

        {/* Comment list */}
        <div className="mt-6 px-3 sm:px-0">
          {isLoading ? (
            <div className="space-y-0">
              {/* Loading state */}
              <div className="flex items-center justify-center py-8 mb-6">
                <div className="flex items-center gap-3 text-gray-500">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                  <span className="text-sm font-medium [font-family:'Lato',Helvetica]">
                    Loading comments...
                  </span>
                </div>
              </div>

              {/* Skeleton - first with replies */}
              <CommentSkeleton withReplies={true} />

              {/* Other skeletons */}
              {Array.from({ length: 2 }, (_, i) => (
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

        {/* Bottom safe margin */}
        <div className="h-24 md:h-8"></div>
      </div>

      {/* Reply modal */}
      <ReplyModal
        isOpen={replyState.isReplying}
        onClose={() => setReplyState({ isReplying: false })}
        targetComment={replyState.targetComment}
        targetType={targetType}
        targetId={targetId}
        articleId={targetType === 'article' ? articleWithComments.article?.id?.toString() : undefined}
        replyState={{
          isReplying: replyState.isReplying,
          parentId: replyState.parentId,
          replyToId: replyState.replyToId,
          replyToUser: replyState.replyToUser
        }}
        onReplyComplete={() => setReplyState({ isReplying: false })}
      />
    </div>
  );
};