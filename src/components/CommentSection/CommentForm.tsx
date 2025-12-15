// Comment form component

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCreateComment } from '../../hooks/queries/useComments';
import { useUser } from '../../contexts/UserContext';
import { CreateCommentRequest } from '../../types/comment';

interface CommentFormProps {
  targetType: 'article' | 'treasury' | 'user' | 'space';
  targetId: string;
  parentId?: string;
  replyToId?: string;
  replyToUser?: string;
  onSubmitSuccess?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  className?: string;
  onLoadComments?: () => void;
  showingPrototypeComments?: boolean;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  targetType,
  targetId,
  parentId,
  replyToId,
  replyToUser,
  onSubmitSuccess,
  onCancel,
  placeholder = '写下你对这篇文章的想法...',
  className = '',
  onLoadComments,
  showingPrototypeComments = false
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useUser();
  const createCommentMutation = useCreateComment();

  const handleSubmit = async () => {
    if (!content.trim()) return;
    if (!user) {
      alert('请先登录');
      return;
    }

    setIsSubmitting(true);

    const commentData: CreateCommentRequest = {
      content: content.trim(),
      targetType,
      targetId,
      ...(parentId && { parentId }),
      ...(replyToId && { replyToId }),
    };

    try {
      await createCommentMutation.mutateAsync(commentData);
      setContent('');
      onSubmitSuccess?.();
    } catch (error) {
      console.error('Failed to create comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent('');
    onCancel?.();
  };

  // User avatar with gradient
  const getAvatarGradient = () => {
    if (!user?.id) return 'bg-gray-400';
    const gradients = [
      'bg-gradient-to-br from-purple-500 to-pink-500',
      'bg-gradient-to-br from-blue-500 to-cyan-500',
      'bg-gradient-to-br from-green-500 to-teal-500',
      'bg-gradient-to-br from-yellow-500 to-orange-500',
      'bg-gradient-to-br from-indigo-500 to-purple-500',
    ];
    return gradients[user.id % gradients.length];
  };

  if (!user) {
    return (
      <div className={`py-6 border-b border-gray-100 ${className}`}>
        <div className="text-center py-4">
          <p className="text-gray-500 mb-3">
            <Link
              to="/login"
              className="text-blue-500 hover:text-blue-600 underline cursor-pointer"
            >
              登录
            </Link>
            后参与评论讨论
          </p>
          <button
            onClick={onLoadComments}
            className={`inline-block px-6 py-3 text-white rounded-lg font-semibold transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg ${
              showingPrototypeComments
                ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700'
                : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700'
            }`}
          >
            {showingPrototypeComments ? '隐藏原型评论' : '展示原型评论'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`py-6 border-b border-gray-200 ${className}`}>
      <div className="flex gap-4">
        {/* User avatar */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-base ${getAvatarGradient()}`}>
          {user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
        </div>

        {/* Comment input */}
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={replyToUser ? `回复 @${replyToUser}...` : '写下你对这篇文章的想法...'}
              className="w-full p-4 bg-transparent border-0 rounded-lg resize-none focus:outline-none text-gray-900 placeholder-gray-500"
              rows={4}
              disabled={isSubmitting}
            />

            {/* Action bar */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white rounded-b-lg">
              <div className="text-sm text-gray-500">
                {content.length > 0 && (
                  <span className={content.length > 500 ? 'text-red-500' : ''}>
                    {content.length}/500
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                {onCancel && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-all"
                    disabled={isSubmitting}
                  >
                    取消
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!content.trim() || isSubmitting || content.length > 500}
                  className="px-6 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  {isSubmitting ? '发布中...' : '发布评论'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};