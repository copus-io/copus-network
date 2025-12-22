// Optimized comment item component
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Comment } from '../../types/comment';
import { useToggleCommentLike, useDeleteComment, useUpdateComment, useLoadCommentReplies } from '../../hooks/queries/useComments';
import { CommentForm } from './CommentForm';
import { useUser } from '../../contexts/UserContext';
import { CommentAvatar } from './CommentAvatar';
import { CommentUserInfo } from './CommentUserInfo';
import { CommentActions } from './CommentActions';
import { EditCommentForm } from './EditCommentForm';
import { ReplyItem } from './ReplyItem';
import { REPLY_COLLAPSE_THRESHOLD } from './constants';

interface CommentItemProps {
  comment: Comment;
  replies?: Comment[];
  targetType: 'article' | 'treasury' | 'user' | 'space';
  targetId: string;
  articleId?: string;
  className?: string;
  onReplyClick?: (commentId: string, userName: string, parentId?: string) => void;
}

export const CommentItemOptimized: React.FC<CommentItemProps> = ({
  comment,
  replies = [],
  targetType,
  targetId,
  articleId,
  className = '',
  onReplyClick
}) => {
  // State management
  const [showEditForm, setShowEditForm] = useState(false);
  const [isLiked, setIsLiked] = useState(comment.isLiked);
  const [likesCount, setLikesCount] = useState(comment.likesCount);
  const [repliesExpanded, setRepliesExpanded] = useState(false);
  const [repliesVisible, setRepliesVisible] = useState(false);

  // Refs and hooks
  const commentRef = useRef<HTMLDivElement>(null);
  const toggleLikeMutation = useToggleCommentLike();
  const deleteCommentMutation = useDeleteComment();
  const updateCommentMutation = useUpdateComment();
  const { user } = useUser();

  // Load replies hook
  const {
    data: loadedRepliesData,
    isLoading: repliesLoading,
    refetch: refetchReplies,
    isFetching: repliesFetching
  } = useLoadCommentReplies(
    targetType,
    targetId,
    comment.id,
    { enabled: false, articleId }
  );

  // Memoized values
  const isTemporary = useMemo(() => (comment as any)._isTemporary, [comment]);
  const isNew = useMemo(() => (comment as any)._isNew, [comment]);
  const canEdit = useMemo(() => user?.id === comment.authorId, [user?.id, comment.authorId]);
  const canDelete = useMemo(() => user?.id === comment.authorId, [user?.id, comment.authorId]);

  // Get actual replies (either passed or loaded)
  const actualReplies = useMemo(() => {
    if (loadedRepliesData?.replies) {
      return loadedRepliesData.replies;
    }
    return replies.filter(reply => reply.parentId === comment.id);
  }, [loadedRepliesData?.replies, replies, comment.id]);

  // Auto-scroll effect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const highlightCommentId = urlParams.get('comment');

    if (highlightCommentId === comment.id) {
      setTimeout(() => {
        commentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [comment.id]);

  // Memoized handlers
  const handleLike = useCallback(() => {
    if (!user) {
      alert('Please log in first');
      return;
    }

    const newIsLiked = !isLiked;
    const newLikesCount = newIsLiked ? likesCount + 1 : Math.max(0, likesCount - 1);

    setIsLiked(newIsLiked);
    setLikesCount(newLikesCount);

    toggleLikeMutation.mutate(comment.id, {
      onError: () => {
        setIsLiked(!newIsLiked);
        setLikesCount(isLiked ? likesCount + 1 : Math.max(0, likesCount - 1));
      }
    });
  }, [user, isLiked, likesCount, comment.id, toggleLikeMutation]);

  const handleReply = useCallback(() => {
    onReplyClick?.(comment.id, comment.authorName);
  }, [comment.id, comment.authorName, onReplyClick]);

  const handleEdit = useCallback(() => {
    setShowEditForm(true);
  }, []);

  const handleEditSubmit = useCallback(async (content: string) => {
    try {
      await updateCommentMutation.mutateAsync({
        commentId: comment.id,
        data: { content, articleId }
      });
      setShowEditForm(false);
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  }, [comment.id, articleId, updateCommentMutation]);

  const handleEditCancel = useCallback(() => {
    setShowEditForm(false);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await deleteCommentMutation.mutateAsync({
        commentId: comment.id,
        articleId: articleId || targetId
      });
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  }, [comment.id, articleId, targetId, deleteCommentMutation]);

  const handleLoadReplies = useCallback(async () => {
    if (!repliesVisible) {
      setRepliesVisible(true);
      if (!loadedRepliesData?.replies) {
        await refetchReplies();
      }
    } else {
      setRepliesVisible(false);
    }
  }, [repliesVisible, loadedRepliesData?.replies, refetchReplies]);

  const toggleRepliesExpanded = useCallback(() => {
    setRepliesExpanded(prev => !prev);
  }, []);

  // Render helpers
  const renderReplies = () => {
    if (!repliesVisible) return null;

    if (repliesLoading || repliesFetching) {
      return (
        <div className="ml-12 mt-4 flex items-center gap-2 text-gray-500">
          <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <span className="text-sm">Loading replies...</span>
        </div>
      );
    }

    if (!actualReplies?.length) {
      return (
        <div className="ml-12 mt-4 text-gray-500 text-sm">
          No replies yet
        </div>
      );
    }

    const visibleReplies = repliesExpanded
      ? actualReplies
      : actualReplies.slice(0, REPLY_COLLAPSE_THRESHOLD);

    return (
      <div className="ml-12 mt-4 space-y-4">
        {visibleReplies.map((reply) => (
          <ReplyItem
            key={reply.id}
            reply={reply}
            toggleLikeMutation={toggleLikeMutation}
            targetId={targetId}
            targetType={targetType}
            parentComment={comment}
            allReplies={actualReplies}
            articleId={articleId}
            onReplyClick={onReplyClick}
          />
        ))}

        {/* Show more/less button */}
        {actualReplies.length > REPLY_COLLAPSE_THRESHOLD && (
          <button
            onClick={toggleRepliesExpanded}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            {repliesExpanded
              ? `Show less`
              : `Show ${actualReplies.length - REPLY_COLLAPSE_THRESHOLD} more replies`
            }
          </button>
        )}
      </div>
    );
  };

  return (
    <div
      ref={commentRef}
      id={`comment-${comment.id}`}
      className={`${className} ${isTemporary ? 'opacity-60 bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3' : ''} ${isNew ? 'bg-green-50 border border-green-200 rounded-lg p-3 animate-pulse' : ''}`}
    >
      <div className="flex gap-3">
        <CommentAvatar comment={comment} />

        <div className="flex-1">
          <CommentUserInfo
            comment={comment}
            isTemporary={isTemporary}
          />

          {/* Comment content or edit form */}
          <div className="mb-3">
            {showEditForm ? (
              <EditCommentForm
                initialContent={comment.content}
                onSubmit={handleEditSubmit}
                onCancel={handleEditCancel}
                isSubmitting={updateCommentMutation.isPending}
              />
            ) : (
              <div className="text-gray-900 text-lg leading-relaxed [font-family:'Lato',Helvetica] break-words">
                {comment.content}
              </div>
            )}
          </div>

          {/* Actions */}
          {!showEditForm && (
            <CommentActions
              comment={comment}
              likesCount={likesCount}
              isLiked={isLiked}
              canEdit={canEdit}
              canDelete={canDelete}
              isSubmitting={updateCommentMutation.isPending || deleteCommentMutation.isPending}
              onLike={handleLike}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}

          {/* Replies section */}
          {(comment.repliesCount > 0 || actualReplies.length > 0) && (
            <div className="mt-4">
              <button
                onClick={handleLoadReplies}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors flex items-center gap-1"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${repliesVisible ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {repliesVisible
                  ? 'Hide replies'
                  : `Show ${comment.repliesCount || actualReplies.length} replies`
                }
              </button>

              {renderReplies()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};