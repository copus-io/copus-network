// Comment skeleton loading component

import React from 'react';

interface CommentSkeletonProps {
  className?: string;
  withReplies?: boolean; // 是否显示回复骨架
}

export const CommentSkeleton: React.FC<CommentSkeletonProps> = ({
  className = '',
  withReplies = false
}) => {
  return (
    <div className={`${className}`}>
      {/* Main comment skeleton */}
      <div className="pt-5 pb-10 border-b border-[#D3D3D3] last:border-b-0">
        <div className="flex gap-3">
          {/* Avatar skeleton with shimmer effect */}
          <div className="relative w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full animate-[shimmer_1.5s_infinite] opacity-60"></div>
          </div>

          <div className="flex-1 space-y-3">
            {/* User name and time skeleton */}
            <div className="flex items-center gap-3">
              <div className="relative h-4 bg-gray-200 rounded w-24 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full animate-[shimmer_1.5s_infinite] opacity-60"></div>
              </div>
              <div className="relative h-3 bg-gray-200 rounded w-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full animate-[shimmer_1.5s_infinite] opacity-60"></div>
              </div>
            </div>

            {/* Content skeleton with varying widths */}
            <div className="space-y-2">
              <div className="relative h-4 bg-gray-200 rounded w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full animate-[shimmer_1.5s_infinite] opacity-60"></div>
              </div>
              <div className="relative h-4 bg-gray-200 rounded w-3/4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full animate-[shimmer_1.5s_infinite] opacity-60"></div>
              </div>
              <div className="relative h-4 bg-gray-200 rounded w-1/2 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full animate-[shimmer_1.5s_infinite] opacity-60"></div>
              </div>
            </div>

            {/* Actions skeleton */}
            <div className="flex items-center gap-4 pt-2">
              <div className="relative h-6 bg-gray-200 rounded-full px-3 w-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full animate-[shimmer_1.5s_infinite] opacity-60"></div>
              </div>
              <div className="relative h-6 bg-gray-200 rounded-full px-3 w-14 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full animate-[shimmer_1.5s_infinite] opacity-60"></div>
              </div>
              {withReplies && (
                <div className="relative h-6 bg-gray-200 rounded-full px-3 w-20 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full animate-[shimmer_1.5s_infinite] opacity-60"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reply skeletons */}
        {withReplies && (
          <div className="mt-4 ml-8 pl-6 border-l border-[#f0f0f0] space-y-4">
            {Array.from({ length: 2 }, (_, i) => (
              <div key={i} className="flex gap-3">
                <div className="relative w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full animate-[shimmer_1.5s_infinite] opacity-60"></div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="relative h-3 bg-gray-200 rounded w-20 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full animate-[shimmer_1.5s_infinite] opacity-60"></div>
                    </div>
                    <div className="relative h-3 bg-gray-200 rounded w-12 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full animate-[shimmer_1.5s_infinite] opacity-60"></div>
                    </div>
                  </div>
                  <div className="relative h-3 bg-gray-200 rounded w-3/4 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full animate-[shimmer_1.5s_infinite] opacity-60"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative h-5 bg-gray-200 rounded w-10 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full animate-[shimmer_1.5s_infinite] opacity-60"></div>
                    </div>
                    <div className="relative h-5 bg-gray-200 rounded w-12 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full animate-[shimmer_1.5s_infinite] opacity-60"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};