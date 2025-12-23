// Comment Button Component for bottom bar integration

import React from 'react';

interface CommentButtonProps {
  commentCount: number;
  isLoading?: boolean;
  onClick: () => void;
  isExpanded?: boolean;
}

export const CommentButton: React.FC<CommentButtonProps> = ({
  commentCount,
  isLoading = false,
  onClick,
  isExpanded = false
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const getCommentsText = () => {
    if (isLoading) return '...';
    if (commentCount === 0) return '0';
    return commentCount.toString();
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        inline-flex items-center relative overflow-hidden group
        h-[42px] rounded-[21px] gap-[8px] px-5 py-2
        cursor-pointer hover:scale-[1.02] active:scale-[0.98]
      `}
      style={{
        transition: 'all 600ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 400ms cubic-bezier(0.4, 0.0, 0.2, 1)',
        transform: isExpanded ? 'scale(1.05)' : 'scale(1)',
        background: isExpanded
          ? 'linear-gradient(135deg, #ff7849 0%, #f23a00 85%, #e03200 100%)'
          : isHovered
          ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.92) 50%, rgba(243, 244, 246, 0.88) 100%)'
          : 'linear-gradient(145deg, rgba(255, 255, 255, 0.92) 0%, rgba(249, 250, 251, 0.88) 50%, rgba(243, 244, 246, 0.85) 100%)',
        backdropFilter: isExpanded
          ? 'blur(25px) brightness(1.05) saturate(1.3) contrast(1.1)'
          : isHovered
          ? 'blur(25px) brightness(1.18) saturate(1.2) contrast(1.05)'
          : 'blur(25px) brightness(1.12) saturate(1.15) contrast(1.03)',
        WebkitBackdropFilter: isExpanded
          ? 'blur(25px) brightness(1.05) saturate(1.3) contrast(1.1)'
          : isHovered
          ? 'blur(25px) brightness(1.18) saturate(1.2) contrast(1.05)'
          : 'blur(25px) brightness(1.12) saturate(1.15) contrast(1.03)',
        border: isExpanded
          ? '1px solid rgba(255, 255, 255, 0.5)'
          : isHovered
          ? '1px solid rgba(255, 255, 255, 0.8)'
          : '1px solid rgba(255, 255, 255, 0.7)',
        boxShadow: isExpanded
          ? `0 6px 20px rgba(242, 58, 0, 0.2),
             0 2px 8px rgba(242, 58, 0, 0.12),
             inset 0 1px 0 rgba(255, 255, 255, 0.35),
             inset 0 -1px 0 rgba(0, 0, 0, 0.08)`
          : isHovered
          ? `0 6px 20px rgba(0, 0, 0, 0.08),
             0 2px 6px rgba(0, 0, 0, 0.06),
             inset 0 1px 0 rgba(255, 255, 255, 0.95),
             inset 0 0 25px rgba(255, 255, 255, 0.25)`
          : `0 4px 16px rgba(0, 0, 0, 0.06),
             0 1px 4px rgba(0, 0, 0, 0.04),
             inset 0 1px 0 rgba(255, 255, 255, 0.9),
             inset 0 0 20px rgba(255, 255, 255, 0.2)`,
      }}
      aria-label={`Comments, ${commentCount} comments`}
      title={`View comments (${commentCount})`}
    >
      {/* 背景光晕效果 */}
      {isExpanded && (
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, rgba(255, 107, 53, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 70% 70%, rgba(242, 58, 0, 0.12) 0%, transparent 50%),
              linear-gradient(45deg, rgba(255, 120, 73, 0.08) 0%, rgba(224, 50, 0, 0.06) 100%)
            `,
            borderRadius: 'inherit',
            animation: 'subtle-pulse 3s ease-in-out infinite',
            transition: 'opacity 600ms cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        />
      )}

      {/* 添加CSS关键帧动画 */}
      <style jsx>{`
        @keyframes subtle-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.9; }
        }
      `}</style>

      {/* Apple-style icon with enhanced contrast */}
      <div className="relative z-10">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          style={{
            transition: 'all 600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: isExpanded ? 'scale(1.1) rotate(5deg)' : isHovered ? 'scale(1.05)' : 'scale(1) rotate(0deg)',
            color: isExpanded
              ? 'rgba(255, 255, 255, 0.98)'
              : isHovered
              ? 'rgba(71, 85, 105, 0.9)'
              : 'rgba(71, 85, 105, 0.8)',
            filter: isExpanded
              ? 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.25))'
              : isHovered
              ? 'drop-shadow(0 1px 2px rgba(255, 255, 255, 0.9))'
              : 'drop-shadow(0 0.5px 1px rgba(255, 255, 255, 0.8))',
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.691 1.109 3.194 2.676 3.741A11.04 11.04 0 0010.5 18a11.04 11.04 0 008.575-4.009c1.567-.547 2.676-2.05 2.676-3.741V6.75A2.25 2.25 0 0019.5 4.5H4.5A2.25 2.25 0 002.25 6.75v4.501z"
          />
        </svg>
      </div>

      {/* Apple-style text with enhanced readability */}
      <span
        className="relative z-10 [font-family:'Lato',Helvetica] font-semibold text-sm tracking-[0.3px]"
        style={{
          transition: 'all 500ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          color: isExpanded
            ? 'rgba(255, 255, 255, 0.98)'
            : isHovered
            ? 'rgba(71, 85, 105, 0.92)'
            : 'rgba(71, 85, 105, 0.85)',
          textShadow: isExpanded
            ? '0 1px 3px rgba(0, 0, 0, 0.25)'
            : isHovered
            ? '0 1px 2px rgba(255, 255, 255, 0.95)'
            : '0 0.5px 1px rgba(255, 255, 255, 0.9)',
          fontWeight: isExpanded ? '600' : isHovered ? '550' : '500',
        }}
      >
        {getCommentsText()}
      </span>
    </button>
  );
};