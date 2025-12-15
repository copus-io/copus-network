// Individual comment item component

import React, { useState } from 'react';
import { Comment } from '../../types/comment';
import { useToggleCommentLike } from '../../hooks/queries/useComments';
import { CommentForm } from './CommentForm';

interface CommentItemProps {
  comment: Comment;
  replies?: Comment[];
  targetType: 'article' | 'treasury' | 'user' | 'space';
  targetId: string;
  className?: string;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  replies = [],
  targetType,
  targetId,
  className = ''
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const toggleLikeMutation = useToggleCommentLike();

  const handleLike = () => {
    toggleLikeMutation.mutate(comment.id);
  };

  const handleReply = () => {
    setShowReplyForm(!showReplyForm);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return '刚刚';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分钟前`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小时前`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}天前`;

    return date.toLocaleDateString('zh-CN', {
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
        {/* User avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm ${getAvatarGradient(comment.authorId)}`}>
          {comment.authorName?.[0]?.toUpperCase() || 'U'}
        </div>

        <div className="flex-1">
          {/* User info and time */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-gray-900 text-sm">
              {comment.authorName}
            </span>
            <span className="text-xs text-gray-500">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>

          {/* Comment content */}
          <div className="text-gray-800 text-sm leading-relaxed mb-3">
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
              className={`inline-flex items-center gap-1 text-xs transition-all duration-200 ${
                comment.isLiked
                  ? 'text-red-500'
                  : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <span>❤️</span>
              <span>{comment.likesCount}</span>
            </button>

            <button
              onClick={handleReply}
              className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 transition-all duration-200"
            >
              <span>💬</span>
              <span>回复</span>
            </button>
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

          {/* Replies */}
          {replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {replies.map((reply) => (
                <div key={reply.id} className="flex gap-3">
                  {/* Reply avatar */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-sm ${getAvatarGradient(reply.authorId)}`}>
                    {reply.authorName?.[0]?.toUpperCase() || 'U'}
                  </div>

                  <div className="flex-1">
                    {/* Reply user info */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900 text-sm">
                        {reply.authorName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(reply.createdAt)}
                      </span>
                    </div>

                    {/* Reply content with @mention styling */}
                    <div className="text-gray-800 text-sm leading-relaxed mb-3">
                      {reply.content}
                    </div>

                    {/* Reply actions */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleLikeMutation.mutate(reply.id)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                          reply.isLiked
                            ? 'text-red-500 bg-red-50 hover:bg-red-100'
                            : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                        }`}
                      >
                        <span className="text-sm">❤️</span>
                        <span>{reply.likesCount}</span>
                      </button>

                      <button
                        onClick={() => {
                          // TODO: Implement reply to reply
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition-all duration-200"
                      >
                        <span className="text-sm">💬</span>
                        <span>回复</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};