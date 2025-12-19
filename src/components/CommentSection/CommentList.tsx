// Comment list component

import React, { useState } from 'react';
import { Comment } from '../../types/comment';
import { CommentItem } from './CommentItem';

interface CommentListProps {
  comments: Comment[];
  targetType: 'article' | 'treasury' | 'user' | 'space';
  targetId: string;
  hasMore?: boolean;
  totalCount?: number;
  className?: string;
}

export const CommentList: React.FC<CommentListProps> = ({
  comments,
  targetType,
  targetId,
  hasMore = false,
  totalCount = 0,
  className = ''
}) => {
  const [loadingMore, setLoadingMore] = useState(false);


  const handleLoadMore = async () => {
    setLoadingMore(true);
    // TODO: Implement pagination
    // For now, just simulate loading
    setTimeout(() => {
      setLoadingMore(false);
    }, 1000);
  };

  const topLevelComments = comments.filter(comment => comment.depth === 0);
  const getRepliesForComment = (commentId: string) => {
    return comments.filter(comment => comment.parentId === commentId);
  };


  if (comments.length === 0) {
    return (
      <div className={`py-16 text-center ${className}`}>
        <div className="text-gray-400 text-6xl mb-4">💭</div>
        <p className="text-gray-600 text-lg mb-2 [font-family:'Lato',Helvetica]">No comments yet</p>
        <p className="text-gray-500 [font-family:'Lato',Helvetica]">Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Comments list */}
      <div className="space-y-0">
        {topLevelComments.map((comment, index) => (
          <div key={comment.id} className="pt-5 pb-10 border-b border-[#D3D3D3] last:border-b-0 last:pb-0">
            <CommentItem
              comment={comment}
              replies={getRepliesForComment(comment.id)}
              targetType={targetType}
              targetId={targetId}
            />
          </div>
        ))}
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="text-center py-8 border-t border-gray-100 mt-6">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-8 py-3 text-sm text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium [font-family:'Lato',Helvetica]"
            style={{ outline: 'none' }}
          >
            {loadingMore ? 'Loading...' : `Load more (${Math.max(0, totalCount - comments.length)} remaining)`}
          </button>
        </div>
      )}
    </div>
  );
};