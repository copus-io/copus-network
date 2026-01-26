// Comment section utility functions
import { Comment } from '../../types/comment';

/**
 * Format username with fallback to Anonymous
 */
export const formatUsername = (comment: Comment | any): string => {
  return comment.authorName || comment.username || 'Anonymous';
};

/**
 * Get user display name from user object
 */
export const getUserDisplayName = (userObj: any): string => {
  if (!userObj) return '';
  return userObj.username || 'Anonymous';
};

/**
 * Truncate content with smart ellipsis
 */
export const truncateContent = (content: string, maxLength: number = 40): string => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength).trim() + '...';
};

/**
 * Format time ago display
 */
export const formatTimeAgo = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Handle user navigation
 */
export const navigateToUser = (navigate: (path: string) => void, comment: Comment): void => {
  if (comment.authorNamespace) {
    navigate(`/u/${comment.authorNamespace}`);
  } else if (comment.authorId) {
    navigate(`/user/${comment.authorId}/treasury`);
  }
};