// Floating Comment Section - Bottom floating comment section component

import React, { useState, useRef, useEffect } from 'react';
import { CommentSection } from './CommentSection';
import { useArticleWithComments } from '../../hooks/queries/useArticleWithComments';

interface FloatingCommentSectionProps {
  targetType: 'article' | 'treasury' | 'user' | 'space';
  targetId: string;
  className?: string;
}

export const FloatingCommentSection: React.FC<FloatingCommentSectionProps> = ({
  targetType,
  targetId,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  // 获取评论数量
  const { totalComments, isLoading } = useArticleWithComments(
    targetType === 'article' ? targetId : '',
    {
      commentsEnabled: false
    }
  );

  // 暂时禁用滚动隐藏，让按钮始终显示以便调试
  useEffect(() => {
    setIsVisible(true); // 始终显示按钮
  }, []);

  // 处理展开/收起
  const handleToggle = () => {
    setIsExpanded(prev => !prev);
  };

  // 处理背景点击关闭
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsExpanded(false);
    }
  };

  // Prevent closing when clicking inside comment area
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // 获取评论数量的显示文本
  const getCommentsText = () => {
    if (isLoading) return '...';
    if (totalComments === 0) return 'Write comment';
    if (totalComments === 1) return '1 comment';
    return `${totalComments} comments`;
  };

  return (
    <>
      {/* 背景遮罩 - 只在展开时显示 */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={handleBackdropClick}
          style={{
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* Bottom floating button and comment area container */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 ${className}`}>
        {/* Comment area content - expand from bottom */}
        <div
          ref={contentRef}
          className={`transition-all duration-500 ease-out ${
            isExpanded
              ? 'translate-y-0 opacity-100'
              : 'translate-y-full opacity-0 pointer-events-none'
          }`}
          onClick={handleContentClick}
        >
          <div className="bg-white shadow-2xl">
            {/* Comment area header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <h3 className="[font-family:'Lato',Helvetica] font-[600] text-lg text-[#231f20]">
                  Comments
                </h3>
                {!isLoading && (
                  <span className="[font-family:'Lato',Helvetica] text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {totalComments} {totalComments === 1 ? 'comment' : 'comments'}
                  </span>
                )}
              </div>
              <button
                onClick={handleToggle}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Comment area content */}
            <div className="max-h-[70vh] overflow-y-auto">
              {isExpanded && (
                <CommentSection
                  targetType={targetType}
                  targetId={targetId}
                  className="px-0 py-0"
                />
              )}
            </div>
          </div>
        </div>

        {/* Bottom floating button */}
        <div
          ref={buttonRef}
          className={`transition-all duration-300 ${
            !isExpanded
              ? 'translate-y-0 opacity-100'
              : 'translate-y-full opacity-0'
          }`}
        >
          <div className="p-4 bg-gradient-to-t from-white via-white to-transparent">
            <button
              onClick={handleToggle}
              className="w-full flex items-center justify-between p-4 bg-orange-500 rounded-2xl shadow-lg border border-orange-600 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                {/* Comment icon */}
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#f23a00] group-hover:bg-[#e33400] transition-colors shadow-sm">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>

                {/* Text content */}
                <div className="flex flex-col items-start">
                  <span className="[font-family:'Lato',Helvetica] font-[600] text-white text-lg">
                    {getCommentsText()}
                  </span>
                  <span className="[font-family:'Lato',Helvetica] text-sm text-white text-opacity-80">
                    {totalComments === 0 ? 'Share your thoughts' : 'Click to view or post comments'}
                  </span>
                </div>
              </div>

              {/* Up arrow */}
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 text-white text-opacity-80 group-hover:text-white transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Reserve space for floating button to avoid blocking page content */}
      {!isExpanded && <div className="h-24"></div>}
    </>
  );
};