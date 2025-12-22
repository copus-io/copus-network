// Expandable Comment Section - Expandable comment section component

import React, { useState, useRef, useEffect } from 'react';
import { CommentSection } from './CommentSection';
import { useArticleWithComments } from '../../hooks/queries/useArticleWithComments';

interface ExpandableCommentSectionProps {
  targetType: 'article' | 'treasury' | 'user' | 'space';
  targetId: string;
  className?: string;
  // Optional configuration
  defaultExpanded?: boolean; // Whether expanded by default
  showPreview?: boolean; // Whether to show preview (recent comments)
  autoCollapse?: boolean; // Whether to auto-collapse
}

export const ExpandableCommentSection: React.FC<ExpandableCommentSectionProps> = ({
  targetType,
  targetId,
  className = '',
  defaultExpanded = false,
  showPreview = false,
  autoCollapse = true
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // 获取评论数量用于按钮显示
  const { totalComments, isLoading } = useArticleWithComments(
    targetType === 'article' ? targetId : '',
    {
      commentsEnabled: false // 只获取评论数量，不加载评论列表
    }
  );

  const handleToggle = () => {
    setIsExpanded(prev => {
      const newValue = !prev;
      setHasUserInteracted(true);

      // If expanding, scroll to comment area
      if (newValue && sectionRef.current) {
        setTimeout(() => {
          sectionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 150);
      }

      return newValue;
    });
  };

  // Get comment area status description
  const getStatusText = () => {
    if (isLoading) return 'Loading comments...';
    if (totalComments === 0) return 'No comments yet. Be the first to comment!';
    if (isExpanded) return 'Click to hide comments';
    return `View ${totalComments} ${totalComments === 1 ? 'comment' : 'comments'}`;
  };

  // 获取评论数量的显示颜色
  const getCommentCountColor = () => {
    if (totalComments === 0) return 'bg-gray-100 text-gray-400';
    if (totalComments > 10) return 'bg-blue-100 text-blue-600';
    if (totalComments > 5) return 'bg-green-100 text-green-600';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div ref={sectionRef} className={`w-full ${className}`}>
      {/* Comment area expand/collapse button */}
      <div className="border-t border-gray-200 bg-white">
        <button
          onClick={handleToggle}
          className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-all duration-200 group focus:outline-none focus:bg-gray-50"
          aria-expanded={isExpanded}
          aria-controls="comment-section-content"
        >
          <div className="flex items-center gap-4">
            {/* 评论图标 - 更大更醒目 */}
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 group-hover:bg-gray-200 group-focus:bg-gray-200 transition-colors">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>

            {/* Comment area title and status */}
            <div className="flex flex-col items-start text-left">
              <div className="flex items-center gap-3 mb-1">
                <span className="[font-family:'Lato',Helvetica] font-[500] text-[#231f20] text-xl">
                  Comments
                </span>
                {/* 评论数量徽章 */}
                {!isLoading && (
                  <span className={`[font-family:'Lato',Helvetica] text-sm font-medium px-3 py-1 rounded-full transition-colors ${getCommentCountColor()}`}>
                    {totalComments}
                  </span>
                )}
                {isLoading && (
                  <div className="w-8 h-6 bg-gray-200 animate-pulse rounded-full"></div>
                )}
              </div>
              <span className="[font-family:'Lato',Helvetica] text-sm text-gray-500 transition-colors group-hover:text-gray-600">
                {getStatusText()}
              </span>
            </div>
          </div>

          {/* 展开/收起图标 */}
          <div className="flex items-center">
            <svg
              className={`w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-all duration-300 ${
                isExpanded ? 'transform rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>
      </div>

      {/* Comment area content - using advanced animations */}
      <div
        ref={contentRef}
        id="comment-section-content"
        className={`transition-all duration-500 ease-in-out ${
          isExpanded
            ? 'max-h-[3000px] opacity-100 translate-y-0'
            : 'max-h-0 opacity-0 -translate-y-2'
        } overflow-hidden`}
        style={{
          transitionProperty: 'max-height, opacity, transform',
        }}
      >
        <div className="bg-gray-50 border-t border-gray-100">
          {/* 只在展开时渲染CommentSection，避免不必要的渲染 */}
          {isExpanded && (
            <div className="animate-fadeIn">
              <CommentSection
                targetType={targetType}
                targetId={targetId}
                className="px-6 py-4"
              />
            </div>
          )}
        </div>
      </div>

      {/* 添加CSS动画类 */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};