import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { CommentSection } from '@/components/CommentSection';
import { CommentButton } from '@/components/ui/CommentButton';
import { useArticleWithComments } from '@/hooks/queries/useArticleWithComments';
import commentIcon from '@/assets/images/comment.svg';

// 🔍 SEARCH: comment-modal-props
interface CommentModalProps {
  articleId: string;
  targetType: 'article';
  onRefetch?: () => void;
}

// 🔍 SEARCH: comment-modal-component
export const CommentModal: React.FC<CommentModalProps> = ({
  articleId,
  targetType,
  onRefetch
}) => {
  const location = useLocation();
  const queryClient = useQueryClient();

  // Comment modal state
  const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false);
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const commentScrollRef = useRef<HTMLDivElement>(null);

  // Get comment count for the comment button
  const { totalComments, isLoading: isCommentsLoading } = useArticleWithComments(
    articleId,
    {
      commentsEnabled: false // Only get comment count, not the full comments
    }
  );

  // 🔍 SEARCH: comment-modal-effects
  // Handle modal animation timing and body scroll lock
  useEffect(() => {
    if (isCommentSectionOpen) {
      console.log('🔒 CommentSection: Locking body scroll');
      // Show modal immediately when opening
      setShouldShowModal(true);

      // Save original styles
      const originalOverflow = window.getComputedStyle(document.body).overflow;
      const originalPosition = window.getComputedStyle(document.body).position;
      console.log('🔒 Original styles:', { overflow: originalOverflow, position: originalPosition });

      // Prevent background scroll with multiple approaches
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';

      // Prevent touch scrolling on iOS, but allow scrolling within the comment section
      const preventTouchMove = (e: TouchEvent) => {
        const target = e.target as Element;

        // Find comment section container (look for elements with overflow-y-auto or similar)
        const commentContainer = target.closest('[class*="overflow-y"]') ||
                                target.closest('.comment-section') ||
                                target.closest('[data-comment-section]');

        if (commentContainer) {
          // Allow touch events within the comment section
          return;
        }

        // Prevent touch events outside the comment section
        e.preventDefault();
      };

      document.addEventListener('touchmove', preventTouchMove, { passive: false });

      // Auto-scroll to top of comment area after modal is fully open
      const scrollTimer = setTimeout(() => {
        if (commentScrollRef.current) {
          commentScrollRef.current.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
      }, 800);

      return () => {
        clearTimeout(scrollTimer);
        console.log('🔓 CommentSection: Restoring body scroll');
        // Restore original styles
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.removeEventListener('touchmove', preventTouchMove);
      };
    } else {
      // Delayed hide for smooth close animation
      const hideTimer = setTimeout(() => {
        setShouldShowModal(false);
      }, 700);

      return () => clearTimeout(hideTimer);
    }
  }, [isCommentSectionOpen]);

  // Refresh comment data when comment section opens
  useEffect(() => {
    if (isCommentSectionOpen && articleId) {
      // Invalidate comment queries to force refresh
      queryClient.invalidateQueries({ queryKey: ['optimizedComments'] });
      queryClient.invalidateQueries({ queryKey: ['articleWithComments'] });
    }
  }, [isCommentSectionOpen, articleId, queryClient]);

  // Handle URL parameters for comments
  useEffect(() => {
    const handleCommentNavigation = () => {
      // Check for comments parameter
      const urlParams = new URLSearchParams(location.search);
      const hasCommentsParam = urlParams.get('comments') === 'open';

      // Check for question-only parameter (browser extension)
      const hasQuestionOnly = urlParams.get('questionOnly') === 'true';

      if (hasCommentsParam || hasQuestionOnly) {
        setIsCommentSectionOpen(true);
      }
    };

    // Handle initial load
    handleCommentNavigation();

    // Handle browser back/forward navigation
    const handlePopState = () => {
      handleCommentNavigation();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location.search]);

  // 🔍 SEARCH: comment-modal-handlers
  const handleCloseComment = () => {
    setIsCommentSectionOpen(false);
    onRefetch?.();
  };

  const handleToggleComment = () => {
    setIsCommentSectionOpen(prev => !prev);
  };

  return (
    <>
      {/* Comment Button */}
      <CommentButton
        commentCount={totalComments || 0}
        isLoading={isCommentsLoading}
        onClick={handleToggleComment}
        isExpanded={isCommentSectionOpen}
      />

      {/* Comment Section Modal - NetEase Music Style */}
      {shouldShowModal && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={handleCloseComment}
            style={{
              transition: 'opacity 600ms cubic-bezier(0.4, 0.0, 0.2, 1), backdrop-filter 800ms cubic-bezier(0.4, 0.0, 0.2, 1)',
              opacity: isCommentSectionOpen ? 1 : 0,
              background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.35) 100%)',
              backdropFilter: isCommentSectionOpen
                ? 'blur(25px) brightness(0.85) saturate(1.6) contrast(1.15)'
                : 'blur(0px) brightness(1) saturate(1) contrast(1)',
              WebkitBackdropFilter: isCommentSectionOpen
                ? 'blur(25px) brightness(0.85) saturate(1.6) contrast(1.15)'
                : 'blur(0px) brightness(1) saturate(1) contrast(1)',
            }}
          />

          {/* Comment modal */}
          <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl overflow-hidden"
            style={{
              transition: 'transform 700ms cubic-bezier(0.25, 1.25, 0.45, 0.95), opacity 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
              transform: isCommentSectionOpen
                ? 'translateY(0%)'
                : 'translateY(100%)',
              opacity: isCommentSectionOpen ? 1 : 0,
              transformOrigin: 'center bottom'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-100"
              style={{
                background: 'linear-gradient(135deg, #fefefe 0%, #f8f9fa 100%)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
              }}
            >
              {/* Header left - Icon and title */}
              <div className="flex items-center space-x-3">
                <div className="w-[40px] h-[40px] rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  <img
                    src={commentIcon}
                    alt="Comments"
                    className="w-[25px] h-[22px]"
                  />
                </div>
                <div>
                  <h3
                    className="text-base lg:text-lg font-semibold text-gray-800 mb-1"
                    style={{
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      fontWeight: '600'
                    }}
                  >
                    Comments
                  </h3>
                  {!isCommentsLoading && (
                    <>
                      <span
                        className="text-xs lg:text-sm text-gray-500 block"
                        style={{
                          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                          fontWeight: '400',
                          opacity: 0.8
                        }}
                      >
                        {totalComments === 0 ? 'No comments yet' : `${totalComments} ${totalComments === 1 ? 'comment' : 'comments'}`}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={handleCloseComment}
                className="flex items-center justify-center w-[36px] h-[36px] rounded-full"
                style={{
                  background: 'rgba(0, 0, 0, 0.04)',
                  transition: 'all 200ms cubic-bezier(0.4, 0.0, 0.2, 1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.04)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Comment section content */}
            <div
              ref={commentScrollRef}
              className="h-[75vh] lg:h-[85vh] overflow-y-auto px-0 lg:px-4"
              data-comment-section="true"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(0,0,0,0.1) transparent'
              }}
              onWheel={(e) => {
                // Ensure scroll events stay within the comment area
                e.stopPropagation();
              }}
            >
              {/* Comment content with proper padding */}
              <div className="mb-12 px-0 lg:px-2">
                {/* Lazy load comments - only render when expanded */}
                {isCommentSectionOpen ? (
                  <CommentSection
                    targetType={targetType}
                    targetId={articleId}
                  />
                ) : (
                  <div className="text-gray-500 [font-family:'Lato',Helvetica] text-sm">
                    Loading comments...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CommentModal;