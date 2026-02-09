import React from 'react';
import { convertVisibilityToLegacyPrivate } from '../../types/article';

interface PrivacyBannerProps {
  isPrivate?: boolean; // Legacy support
  visibility?: number; // New visibility field
  isAuthor: boolean;
  className?: string;
}

export const PrivacyBanner: React.FC<PrivacyBannerProps> = ({
  isPrivate,
  visibility,
  isAuthor,
  className = ""
}) => {
  // Determine current privacy status
  const currentIsPrivate = visibility !== undefined
    ? convertVisibilityToLegacyPrivate(visibility)
    : (isPrivate || false);

  // Only show for private articles when user is the author
  if (!currentIsPrivate || !isAuthor) {
    return null;
  }

  return (
    <div className={`w-full bg-gradient-to-r from-red/5 to-red/10 border border-red/20 rounded-2xl px-6 py-4 mb-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Lock Icon */}
          <div className="flex-shrink-0 p-2 bg-red/10 rounded-full">
            <svg className="w-5 h-5 text-red" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>

          {/* Message */}
          <div className="flex flex-col">
            <span className="[font-family:'Lato',Helvetica] font-semibold text-red text-base flex items-center gap-2">
              <span className="text-lg">🔒</span>
              这是你的私享作品，只有你能看到
            </span>
            <span className="[font-family:'Lato',Helvetica] font-normal text-red/70 text-sm mt-1">
              私享作品不会出现在公共动态和搜索结果中
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrivacyBanner;