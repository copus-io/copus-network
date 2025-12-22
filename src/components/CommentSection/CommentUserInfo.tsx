// Comment user info component
import React from 'react';
import { Comment } from '../../types/comment';
import { formatTimeAgo, navigateToUser } from './utils';
import { useNavigate } from 'react-router-dom';

interface CommentUserInfoProps {
  comment: Comment;
  showTime?: boolean;
  isTemporary?: boolean;
  className?: string;
}

export const CommentUserInfo: React.FC<CommentUserInfoProps> = ({
  comment,
  showTime = true,
  isTemporary = false,
  className = ''
}) => {
  const navigate = useNavigate();

  const handleUserClick = () => {
    navigateToUser(navigate, comment);
  };

  return (
    <div className={`flex items-center gap-2 mb-2 ${className}`}>
      <span
        onClick={handleUserClick}
        className="font-medium text-gray-900 text-lg [font-family:'Lato',Helvetica] cursor-pointer hover:text-blue-600 transition-colors"
      >
        {comment.authorName}
      </span>
      {showTime && (
        <span className="text-sm text-gray-500 [font-family:'Lato',Helvetica]">
          {isTemporary ? (
            <span className="inline-flex items-center gap-1 text-orange-500">
              <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4m0 12v4m8.485-13.485l-2.829 2.829M4.515 4.515l2.829 2.829M20 12h-4M8 12H4m13.485 8.485l-2.829-2.829M4.515 19.485l2.829-2.829" />
              </svg>
              Posting...
            </span>
          ) : (
            formatTimeAgo(comment.createdAt)
          )}
        </span>
      )}
    </div>
  );
};