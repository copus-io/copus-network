// Optimized reply item component
import React, { useState, useCallback } from 'react';
import { Comment } from '../../types/comment';
import { useDeleteComment } from '../../hooks/queries/useComments';
import { useUser } from '../../contexts/UserContext';
import { CommentAvatar } from './CommentAvatar';
import { CommentUserInfo } from './CommentUserInfo';
import { CommentActions } from './CommentActions';
import { CommentQuote } from './CommentQuote';
import { getUserDisplayName, truncateContent } from './utils';

interface ReplyItemProps {
  reply: Comment;
  toggleLikeMutation: any;
  targetId: string;
  targetType: 'article' | 'treasury' | 'user' | 'space';
  parentComment: Comment;
  allReplies: Comment[];
  articleId?: string;
  onReplyClick?: (commentId: string, userName: string, parentId?: string) => void;
}

export const ReplyItem: React.FC<ReplyItemProps> = ({
  reply,
  toggleLikeMutation,
  targetId,
  targetType,
  parentComment,
  allReplies,
  articleId,
  onReplyClick
}) => {
  const deleteCommentMutation = useDeleteComment();
  const { user } = useUser();
  const [replyIsLiked, setReplyIsLiked] = useState(reply.isLiked);
  const [replyLikesCount, setReplyLikesCount] = useState(reply.likesCount);

  // Memoized handlers
  const handleReplyLike = useCallback(() => {
    if (!user) {
      alert('请登录后再进行点赞操作');
      return;
    }

    const newIsLiked = !replyIsLiked;
    const newLikesCount = newIsLiked ? replyLikesCount + 1 : Math.max(0, replyLikesCount - 1);

    setReplyIsLiked(newIsLiked);
    setReplyLikesCount(newLikesCount);

    toggleLikeMutation.mutate(reply.id, {
      onError: () => {
        setReplyIsLiked(!newIsLiked);
        setReplyLikesCount(replyIsLiked ? replyLikesCount + 1 : Math.max(0, replyLikesCount - 1));
      }
    });
  }, [user, replyIsLiked, replyLikesCount, reply.id, toggleLikeMutation]);

  const handleReplyClick = useCallback(() => {
    onReplyClick?.(reply.id, reply.authorName, parentComment.id);
  }, [reply.id, reply.authorName, parentComment.id, onReplyClick]);

  const handleEdit = useCallback(() => {
    // TODO: Implement edit functionality
    console.log('Edit reply:', reply.id);
  }, [reply.id]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Are you sure you want to delete this reply?')) return;

    try {
      await deleteCommentMutation.mutateAsync({
        commentId: reply.id,
        articleId: articleId || targetId
      });
    } catch (error) {
      console.error('Failed to delete reply:', error);
    }
  }, [reply.id, articleId, targetId, deleteCommentMutation]);

  // Format reply content with quote logic
  const formatReplyContent = () => {
    // Check for quote information
    const displayUserName = getUserDisplayName(reply.replyToUser);
    const quoteContent = (reply as any).targetContent;

    if (displayUserName) {
      return (
        <CommentQuote
          reply={reply}
          displayUserName={displayUserName}
          quoteContent={quoteContent}
        />
      );
    }

    // Complex logic for determining reply context (existing logic)
    // TODO: This can be further simplified based on requirements
    return <div>{reply.content}</div>;
  };

  const canEdit = user?.id === reply.authorId;
  const canDelete = user?.id === reply.authorId;

  return (
    <div className="flex gap-3" id={`comment-${reply.id}`}>
      <CommentAvatar comment={reply} size="small" />

      <div className="flex-1">
        <CommentUserInfo comment={reply} />

        <div className="mb-3">
          {formatReplyContent()}
        </div>

        <CommentActions
          comment={reply}
          likesCount={replyLikesCount}
          isLiked={replyIsLiked}
          canEdit={canEdit}
          canDelete={canDelete}
          isSubmitting={deleteCommentMutation.isPending}
          onLike={handleReplyLike}
          onReply={handleReplyClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};