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
}

export const CommentForm: React.FC<CommentFormProps> = ({
  targetType,
  targetId,
  parentId,
  replyToId,
  replyToUser,
  onSubmitSuccess,
  onCancel,
  placeholder = 'Share your thoughts on this link...',
  className = '',
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useUser();
  const createCommentMutation = useCreateComment();

  const handleSubmit = async () => {
    if (!content.trim()) return;
    if (!user) {
      alert('Please log in first');
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
          <p className="text-gray-500 mb-3 [font-family:'Lato',Helvetica]">
            <Link
              to="/login"
              className="text-red hover:text-red/80 underline cursor-pointer"
            >
              Log in
            </Link>
            {' '}to join the discussion
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`py-1 ${className}`}>
      <div className="flex gap-4">
        {/* Comment input */}
        <div className="flex-1">
          <div className="bg-white rounded-lg transition-all">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={replyToUser ? `Reply to @${replyToUser}...` : placeholder}
              className="w-full px-6 py-3 bg-transparent border-0 rounded-lg resize-none text-gray-900 placeholder-gray-500 [font-family:'Lato',Helvetica] text-base"
              style={{ outline: 'none' }}
              rows={2}
              disabled={isSubmitting}
            />

            {/* Action bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-white rounded-b-lg">
              <div className="text-sm text-gray-500 [font-family:'Lato',Helvetica]">
                {content.length > 0 && (
                  <span className={content.length > 500 ? 'text-red' : ''}>
                    {content.length}/500
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                {onCancel && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all [font-family:'Lato',Helvetica]"
                    style={{ outline: 'none' }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!content.trim() || isSubmitting || content.length > 500}
                  className="px-6 py-2 bg-red text-white rounded-full text-sm font-medium hover:bg-red/90 disabled:bg-[#E0E0E0]/40 disabled:text-[#A9A9A9] disabled:cursor-not-allowed transition-all [font-family:'Lato',Helvetica]"
                  style={{ outline: 'none' }}
                >
                  {isSubmitting ? 'Posting...' : 'Post comment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};