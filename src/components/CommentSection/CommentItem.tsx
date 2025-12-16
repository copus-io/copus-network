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
        <div className="flex-1">
          {/* User info and time */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-gray-900 text-base [font-family:'Lato',Helvetica]">
              {comment.authorName}
            </span>
            <span className="text-sm text-gray-500 [font-family:'Lato',Helvetica]">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>

          {/* Comment content */}
          <div className="text-gray-800 text-base leading-relaxed mb-3 [font-family:'Lato',Helvetica]">
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
                comment.isLiked
                  ? 'text-red'
                  : 'text-gray-400 hover:text-red'
              }`}
              style={{ outline: 'none' }}
            >
              <span>❤️</span>
              <span>{comment.likesCount}</span>
            </button>

            <button
              onClick={handleReply}
              className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-red transition-all duration-200 [font-family:'Lato',Helvetica]"
              style={{ outline: 'none' }}
            >
              <span>💬</span>
              <span>Reply</span>
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
                  <div className="flex-1">
                    {/* Reply user info */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900 text-base [font-family:'Lato',Helvetica]">
                        {reply.authorName}
                      </span>
                      <span className="text-sm text-gray-500 [font-family:'Lato',Helvetica]">
                        {formatTimeAgo(reply.createdAt)}
                      </span>
                    </div>

                    {/* Reply content with @mention styling */}
                    <div className="text-gray-800 text-base leading-relaxed mb-3 [font-family:'Lato',Helvetica]">
                      {reply.content}
                    </div>

                    {/* Reply actions */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleLikeMutation.mutate(reply.id)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium transition-all duration-200 [font-family:'Lato',Helvetica] ${
                          reply.isLiked
                            ? 'text-red bg-red-50 hover:bg-red-100'
                            : 'text-gray-500 hover:text-red hover:bg-red-50'
                        }`}
                        style={{ outline: 'none' }}
                      >
                        <span className="text-sm">❤️</span>
                        <span>{reply.likesCount}</span>
                      </button>

                      <button
                        onClick={() => {
                          // TODO: Implement reply to reply
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium text-gray-500 hover:text-red hover:bg-red-50 transition-all duration-200 [font-family:'Lato',Helvetica]"
                        style={{ outline: 'none' }}
                      >
                        <span className="text-sm">💬</span>
                        <span>Reply</span>
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