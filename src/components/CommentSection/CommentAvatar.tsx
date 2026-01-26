// Comment avatar component
import React from 'react';
import { Comment } from '../../types/comment';
import { DEFAULT_AVATAR_URL } from './constants';
import { navigateToUser } from './utils';
import { useNavigate } from 'react-router-dom';

interface CommentAvatarProps {
  comment: Comment;
  size?: 'small' | 'medium';
  className?: string;
}

export const CommentAvatar: React.FC<CommentAvatarProps> = ({
  comment,
  size = 'medium',
  className = ''
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigateToUser(navigate, comment);
  };

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10'
  };

  return (
    <div className="flex-shrink-0">
      <img
        src={comment.authorAvatar || DEFAULT_AVATAR_URL}
        alt={comment.authorName}
        onClick={handleClick}
        className={`${sizeClasses[size]} rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity ${className}`}
      />
    </div>
  );
};