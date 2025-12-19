// Individual comment item component

import React, { useState } from 'react';
import { Comment } from '../../types/comment';
import { useToggleCommentLike, useDeleteComment, useUpdateComment } from '../../hooks/queries/useComments';
import { CommentForm } from './CommentForm';
import { useUser } from '../../contexts/UserContext';

// Edit comment form component
interface EditCommentFormProps {
  initialContent: string;
  onSubmit: (content: string) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const EditCommentForm: React.FC<EditCommentFormProps> = ({
  initialContent,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [content, setContent] = useState(initialContent);

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content.trim());
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Edit your comment..."
        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent [font-family:'Lato',Helvetica]"
        rows={3}
        disabled={isSubmitting}
      />
      <div className="flex justify-end gap-2 mt-3">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 [font-family:'Lato',Helvetica]"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !content.trim()}
          className="px-4 py-2 bg-red text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 [font-family:'Lato',Helvetica]"
        >
          {isSubmitting ? 'Updating...' : 'Update'}
        </button>
      </div>
    </div>
  );
};

interface CommentItemProps {
  comment: Comment;
  replies?: Comment[];
  targetType: 'article' | 'treasury' | 'user' | 'space';
  targetId: string;
  className?: string;
}

// Helper component for replies
const ReplyItemComponent: React.FC<{ reply: Comment; toggleLikeMutation: any; targetId: string }> = ({ reply, toggleLikeMutation, targetId }) => {
  const deleteCommentMutation = useDeleteComment();
  const { user } = useUser();
  const [replyIsLiked, setReplyIsLiked] = useState(reply.isLiked);
  const [replyLikesCount, setReplyLikesCount] = useState(reply.likesCount);

  const handleReplyLike = () => {
    if (!user) {
      // 未登录用户点击点赞，提示需要登录
      alert('请登录后再进行点赞操作');
      return;
    }

    const newIsLiked = !replyIsLiked;
    setReplyIsLiked(newIsLiked);
    setReplyLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);
    toggleLikeMutation.mutate(reply.id);
  };

  const handleReplyDelete = () => {
    if (window.confirm('Are you sure you want to delete this reply?')) {
      deleteCommentMutation.mutate({ commentId: reply.id, articleId: targetId });
    }
  };

  // Check if current user can delete this reply
  const canDeleteReply = user && (reply.canDelete || user.id === reply.authorId);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex gap-3">
      {/* Reply Avatar */}
      <div className="flex-shrink-0">
        {reply.authorAvatar ? (
          <img
            src={reply.authorAvatar}
            alt={reply.authorName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-xs bg-gradient-to-br from-gray-400 to-gray-600`}>
            {reply.authorName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex-1">
        {/* Reply user info */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium text-gray-900 text-lg [font-family:'Lato',Helvetica]">
            {reply.authorName}
          </span>
          <span className="text-sm text-gray-500 [font-family:'Lato',Helvetica]">
            {formatTimeAgo(reply.createdAt)}
          </span>
        </div>

        {/* Reply content */}
        <div className="text-gray-800 text-base leading-relaxed mb-3 [font-family:'Lato',Helvetica] font-light">
          {reply.content}
        </div>

        {/* Reply actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleReplyLike}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium transition-all duration-200 [font-family:'Lato',Helvetica] ${
              replyIsLiked
                ? 'text-red bg-red-50 hover:bg-red-100'
                : 'text-gray-500 hover:text-red hover:bg-red-50'
            }`}
            style={{ outline: 'none' }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={replyIsLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span>{replyLikesCount}</span>
          </button>

          <button
            onClick={() => {
              // TODO: Implement reply to reply
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium text-gray-500 hover:text-red hover:bg-red-50 transition-all duration-200 [font-family:'Lato',Helvetica]"
            style={{ outline: 'none' }}
          >
            <span>Reply</span>
          </button>

          {canDeleteReply && (
            <button
              onClick={handleReplyDelete}
              disabled={deleteCommentMutation.isPending}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium text-gray-500 hover:text-red hover:bg-red-50 transition-all duration-200 [font-family:'Lato',Helvetica]"
              style={{ outline: 'none' }}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="m19,6v14a2,2 0,0 1,-2,2H7a2,2 0,0 1,-2,-2V6m3,0V4a2,2 0,0 1,2,-2h4a2,2 0,0 1,2,2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  replies = [],
  targetType,
  targetId,
  className = ''
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isLiked, setIsLiked] = useState(comment.isLiked);
  const [likesCount, setLikesCount] = useState(comment.likesCount);
  const toggleLikeMutation = useToggleCommentLike();
  const deleteCommentMutation = useDeleteComment();
  const updateCommentMutation = useUpdateComment();
  const { user } = useUser();


  const handleLike = () => {
    if (!user) {
      // 未登录用户点击点赞，提示需要登录
      alert('请登录后再进行点赞操作');
      return;
    }

    // Toggle like state locally
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);

    // Call API mutation
    toggleLikeMutation.mutate(comment.id);
  };

  const handleReply = () => {
    if (!user) {
      // 未登录用户点击回复，提示需要登录
      alert('请登录后再进行回复操作');
      return;
    }
    setShowReplyForm(!showReplyForm);
  };

  const handleEdit = () => {
    if (!user) {
      // 未登录用户点击编辑，提示需要登录
      alert('请登录后再进行编辑操作');
      return;
    }
    setShowEditForm(!showEditForm);
  };

  const handleEditSubmit = (content: string) => {
    updateCommentMutation.mutate(
      { commentId: comment.id, data: { content, articleId: targetId } },
      {
        onSuccess: () => {
          setShowEditForm(false);
        }
      }
    );
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteCommentMutation.mutate({ commentId: comment.id, articleId: targetId });
    }
  };

  // Check if current user can delete this comment
  const canDelete = user && (comment.canDelete || user.id === comment.authorId);

  // Check if current user is the comment author
  const isCommentAuthor = user && user.id === comment.authorId;


  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Generate avatar gradient based on user ID
  const getAvatarGradient = (userId: number) => {
    const gradients = [
      'bg-gradient-to-br from-purple-500 to-pink-500',
      'bg-gradient-to-br from-blue-500 to-cyan-500',
      'bg-gradient-to-br from-green-500 to-teal-500',
      'bg-gradient-to-br from-yellow-500 to-orange-500',
      'bg-gradient-to-br from-indigo-500 to-purple-500',
    ];
    return gradients[userId % gradients.length];
  };

  return (
    <div className={`${className}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {comment.authorAvatar ? (
            <img
              src={comment.authorAvatar}
              alt={comment.authorName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm ${getAvatarGradient(comment.authorId)}`}>
              {comment.authorName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1">
          {/* User info and time */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-gray-900 text-lg [font-family:'Lato',Helvetica]">
              {comment.authorName}
            </span>
            <span className="text-sm text-gray-500 [font-family:'Lato',Helvetica]">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>

          {/* Comment content */}
          <div className="text-gray-800 text-base leading-relaxed mb-3 [font-family:'Lato',Helvetica] font-light">
            {comment.content.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {index < comment.content.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              disabled={toggleLikeMutation.isPending}
              className={`inline-flex items-center gap-1 text-sm transition-all duration-200 [font-family:'Lato',Helvetica] ${
                isLiked
                  ? 'text-red'
                  : 'text-gray-400 hover:text-red'
              }`}
              style={{ outline: 'none' }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span>{likesCount}</span>
            </button>

            {isCommentAuthor ? (
              <button
                onClick={handleEdit}
                className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-red transition-all duration-200 [font-family:'Lato',Helvetica]"
                style={{ outline: 'none' }}
              >
                <span>Edit</span>
              </button>
            ) : (
              <button
                onClick={handleReply}
                className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-red transition-all duration-200 [font-family:'Lato',Helvetica]"
                style={{ outline: 'none' }}
              >
                <span>Reply</span>
              </button>
            )}

            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={deleteCommentMutation.isPending}
                className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-red transition-all duration-200 [font-family:'Lato',Helvetica]"
                style={{ outline: 'none' }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3,6 5,6 21,6"></polyline>
                  <path d="m19,6v14a2,2 0,0 1,-2,2H7a2,2 0,0 1,-2,-2V6m3,0V4a2,2 0,0 1,2,-2h4a2,2 0,0 1,2,2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                <span>Delete</span>
              </button>
            )}
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-4">
              <CommentForm
                targetType={targetType}
                targetId={targetId}
                parentId={comment.id}
                replyToId={comment.id}
                replyToUser={comment.authorName}
                placeholder={`回复 @${comment.authorName}`}
                onSubmitSuccess={() => setShowReplyForm(false)}
                onCancel={() => setShowReplyForm(false)}
              />
            </div>
          )}

          {/* Edit form */}
          {showEditForm && (
            <div className="mt-4">
              <EditCommentForm
                initialContent={comment.content}
                onSubmit={handleEditSubmit}
                onCancel={() => setShowEditForm(false)}
                isSubmitting={updateCommentMutation.isPending}
              />
            </div>
          )}

          {/* Replies */}
          {replies.length > 0 && (
            <div className="mt-4 ml-8 space-y-4 pl-6 border-l border-[#D3D3D3]">
              {replies.map((reply) => (
                <ReplyItemComponent key={reply.id} reply={reply} toggleLikeMutation={toggleLikeMutation} targetId={targetId} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};