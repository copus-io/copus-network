// Edit comment form component
import React, { useState } from 'react';

interface EditCommentFormProps {
  initialContent: string;
  onSubmit: (content: string) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const EditCommentForm: React.FC<EditCommentFormProps> = ({
  initialContent,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [content, setContent] = useState(initialContent);

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content.trim());
  };

  return (
    <div className="mt-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-3 border border-gray-200 rounded-lg resize-none text-gray-900 placeholder-gray-500 [font-family:'Lato',Helvetica] text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        rows={3}
        disabled={isSubmitting}
        placeholder="Edit your comment..."
      />
      <div className="flex justify-end gap-2 mt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all [font-family:'Lato',Helvetica] disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          className="px-6 py-2 bg-red text-white rounded-full text-sm font-medium hover:bg-red/90 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all [font-family:'Lato',Helvetica]"
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
};