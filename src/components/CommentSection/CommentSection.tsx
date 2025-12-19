// Main comment section component - NetEase Cloud Music style

import React, { useState } from 'react';
import { useComments } from '../../hooks/queries/useComments';
import { CommentSortBy } from '../../types/comment';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import { CommentSkeleton } from './CommentSkeleton';

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
  const [sortBy, setSortBy] = useState<CommentSortBy>('newest');

  const { data: commentsData, isLoading, error } = useComments(targetType, targetId, {
    sortBy,
    limit: 20
  });

  const totalComments = commentsData?.totalCount || 0;


  return (
    <div className={`w-full overflow-hidden min-h-[600px] ${className}`}>
      {/* Comment header with stats and sort options */}
      <div className="px-0 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="[font-family:'Lato',Helvetica] font-[450] text-[#231f20] text-2xl">
                Comments
              </span>
              <span className="[font-family:'Lato',Helvetica] text-base text-dark-grey">
                {totalComments} {totalComments === 1 ? 'comment' : 'comments'}
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as CommentSortBy)}
              className="pl-4 pr-10 py-2 border border-[#D3D3D3] rounded-full text-sm text-dark-grey bg-white transition-all [font-family:'Lato',Helvetica] hover:border-medium-grey appearance-none cursor-pointer"
              style={{
                outline: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23686868' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center'
              }}
            >
              <option value="newest">Newest</option>
              <option value="likes">Most liked</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
      </div>

      <div className="px-0 pt-4 pb-0">
        {/* Comment form */}
        <CommentForm
          targetType={targetType}
          targetId={targetId}
        />

        {/* Comment list */}
        <div className="mt-6">
          {isLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 3 }, (_, i) => (
                <CommentSkeleton key={i} />
              ))}
            </div>
          ) : (
            <CommentList
              comments={commentsData?.comments || []}
              targetType={targetType}
              targetId={targetId}
              hasMore={commentsData?.hasMore || false}
              totalCount={totalComments}
            />
          )}
        </div>
      </div>
    </div>
  );
};