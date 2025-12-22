// Comment skeleton loading component

import React from 'react';

interface CommentSkeletonProps {
  className?: string;
}

export const CommentSkeleton: React.FC<CommentSkeletonProps> = ({
  className = ''
}) => {
  return (
    <div className={`py-4 border-b border-gray-100 ${className}`}>
      <div className="flex gap-3">
        {/* Avatar skeleton */}
        <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse" />

        <div className="flex-1 space-y-2">
          {/* User name and time skeleton */}
          <div className="flex items-center gap-3">
            <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
          </div>

          {/* Content skeleton */}
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>

          {/* Actions skeleton */}
          <div className="flex items-center gap-4 pt-1">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-12" />
            <div className="h-6 bg-gray-200 rounded animate-pulse w-12" />
          </div>
        </div>
      </div>
    </div>
  );
};