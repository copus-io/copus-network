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
    <div className={`w-full bg-[#E0E0E0]/40 rounded-2xl px-6 py-4 mb-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Private Icon */}
          <div className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-[#E0E0E0] rounded-[100px]">
            <svg className="w-6 h-6" viewBox="0 0 25 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.9723 3C15.4989 3 14.096 3.66092 12.9955 4.86118C11.9336 3.70292 10.5466 3 9.02774 3C5.7035 3 3 6.36428 3 10.5C3 14.6357 5.7035 18 9.02774 18C10.5466 18 11.9359 17.2971 12.9955 16.1388C14.0937 17.3413 15.492 18 16.9723 18C20.2965 18 23 14.6357 23 10.5C23 6.36428 20.2965 3 16.9723 3ZM3.68213 10.5C3.68213 6.73121 6.08095 3.66313 9.02774 3.66313C11.9745 3.66313 14.3734 6.729 14.3734 10.5C14.3734 11.2206 14.2847 11.9169 14.1232 12.569C14.0937 10.9885 13.3456 9.68877 12.1519 9.39699C10.5966 9.0168 8.86858 10.4956 8.30014 12.6927C8.03183 13.7339 8.05684 14.7838 8.37062 15.6503C8.65712 16.4439 9.15507 17.0053 9.79172 17.2639C9.54161 17.3103 9.28695 17.3347 9.03001 17.3347C6.07867 17.3369 3.68213 14.2688 3.68213 10.5ZM13.4297 15.6149C14.437 14.2732 15.0555 12.4761 15.0555 10.5C15.0555 8.52387 14.437 6.72679 13.4297 5.38506C14.4097 4.27542 15.6648 3.66313 16.9723 3.66313C19.9191 3.66313 22.3179 6.729 22.3179 10.5C22.3179 11.3112 22.2065 12.0893 22.0018 12.8121C22.0473 11.1233 21.2833 9.70424 20.0305 9.3992C18.4752 9.01901 16.7472 10.4978 16.1787 12.695C15.6467 14.7529 16.3197 16.7224 17.6862 17.275C17.452 17.3148 17.2133 17.3391 16.97 17.3391C15.6603 17.3369 14.4097 16.7268 13.4297 15.6149Z" fill="#454545"/>
              <line x1="5.27279" y1="2" x2="22" y2="18.7272" stroke="#454545" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <span className="text-[#454545] text-[14px] font-semibold">Private</span>
          </div>

          {/* Message */}
          <div className="flex flex-col">
            <span className="[font-family:'Lato',Helvetica] font-semibold text-red text-base">
              This is your private content, only you can see it
            </span>
            <span className="[font-family:'Lato',Helvetica] font-light text-red/70 text-sm mt-1">
              Private content won't appear in public feeds or search results
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrivacyBanner;
