// Comment actions component
import React from 'react';
import { Comment } from '../../types/comment';

interface CommentActionsProps {
  comment: Comment;
  likesCount: number;
  isLiked: boolean;
  canEdit: boolean;
  canDelete: boolean;
  isSubmitting?: boolean;
  onLike: () => void;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

export const CommentActions: React.FC<CommentActionsProps> = ({
  comment,
  likesCount,
  isLiked,
  canEdit,
  canDelete,
  isSubmitting = false,
  onLike,
  onReply,
  onEdit,
  onDelete,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-4 mt-2 ${className}`}>
      {/* Like button */}
      <button
        onClick={onLike}
        disabled={isSubmitting}
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-red transition-all duration-200 [font-family:'Lato',Helvetica] disabled:opacity-50"
        style={{ outline: 'none' }}
      >
        <svg
          className={`w-4 h-4 ${isLiked ? 'fill-red text-red' : 'fill-none'}`}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span>{likesCount}</span>
      </button>

      {/* Reply button */}
      <button
        onClick={onReply}
        disabled={isSubmitting}
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-blue-600 transition-all duration-200 [font-family:'Lato',Helvetica] disabled:opacity-50"
        style={{ outline: 'none' }}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
        <span>Reply</span>
      </button>

      {/* Edit button */}
      {canEdit && (
        <button
          onClick={onEdit}
          disabled={isSubmitting}
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-blue-600 transition-all duration-200 [font-family:'Lato',Helvetica] disabled:opacity-50"
          style={{ outline: 'none' }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>Edit</span>
        </button>
      )}

      {/* Delete button */}
      {canDelete && (
        <button
          onClick={onDelete}
          disabled={isSubmitting}
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-red-600 transition-all duration-200 [font-family:'Lato',Helvetica] disabled:opacity-50"
          style={{ outline: 'none' }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Delete</span>
        </button>
      )}
    </div>
  );
};