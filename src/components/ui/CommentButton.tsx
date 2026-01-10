// Comment Button Component for bottom bar integration

import React from 'react';
import commentIcon from '../../assets/images/comment.svg';

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
  const getCommentsText = () => {
    if (isLoading) return '...';
    if (commentCount === 0) return '0';
    return commentCount.toString();
  };

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 lg:gap-[10px] py-2
        h-[38px]
        transition-all duration-200
        cursor-pointer
        hover:opacity-70
      `}
      aria-label={`Comments, ${commentCount} comments`}
      title={`View comments (${commentCount})`}
    >
      {/* Comment icon */}
      <img
        src={commentIcon}
        alt="Comment"
        className="w-[25px] h-[22px]"
        style={{
          filter: 'brightness(0) saturate(100%) invert(27%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(55%) contrast(90%)'
        }}
      />

      {/* Comment count text */}
      <span
        className={`
          [font-family:'Lato',Helvetica] font-light text-lg leading-5
          text-[#454545]
        `}
      >
        {getCommentsText()}
      </span>
    </button>
  );
};
