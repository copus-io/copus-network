// Comment quote/reply component
import React from 'react';
import { Comment } from '../../types/comment';
import { getUserDisplayName, truncateContent } from './utils';

interface CommentQuoteProps {
  reply: Comment;
  displayUserName?: string;
  quoteContent?: string;
  className?: string;
}

export const CommentQuote: React.FC<CommentQuoteProps> = ({
  reply,
  displayUserName,
  quoteContent,
  className = ''
}) => {
  if (!displayUserName) {
    return <div className={className}>{reply.content}</div>;
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {/* 简洁的网易云风格回复引用 */}
      <div className="text-sm text-gray-500 leading-relaxed">
        <span className="text-blue-400">@{displayUserName}</span>
        <span className="mx-1 text-gray-400">:</span>
        <span className="italic text-gray-400">"{quoteContent || 'Original comment'}"</span>
      </div>

      {/* 用户的实际回复内容 */}
      <div className="text-gray-900 leading-relaxed">
        {reply.content}
      </div>
    </div>
  );
};