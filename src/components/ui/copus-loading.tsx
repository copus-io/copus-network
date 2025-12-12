import React from 'react';

// Gem sparkle animation - for button loading
export const GemSpinner: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Main gem */}
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 bg-gradient-to-br from-red-400 via-red-500 to-red-600 rounded-lg transform rotate-45 animate-pulse">
          <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full opacity-80 animate-ping"></div>
        </div>
      </div>

      {/* Surrounding small stars */}
      <div className="absolute inset-0 animate-spin">
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
          <div className="w-1 h-1 bg-yellow-300 rounded-full animate-ping"></div>
        </div>
        <div className="absolute top-1/2 -right-1 transform -translate-y-1/2">
          <div className="w-0.5 h-0.5 bg-blue-300 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
          <div className="w-0.5 h-0.5 bg-green-300 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <div className="absolute top-1/2 -left-1 transform -translate-y-1/2">
          <div className="w-1 h-1 bg-purple-300 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
        </div>
      </div>
    </div>
  );
};

// Full page loading component for route transitions
export const CopusLoading: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center gap-4">
        <GemSpinner size="lg" />
        <span className="text-gray-500 text-sm">{message}</span>
      </div>
    </div>
  );
};

// Book flip animation - for sending verification codes and other document-related operations
export const BookFlip: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <div className="relative w-6 h-6">
        {/* Book base */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-700 rounded-sm"></div>

        {/* Page flip effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-100 rounded-sm transform-gpu origin-left animate-flip">
          <div className="w-full h-full bg-gradient-to-r from-gray-50 to-white rounded-sm">
            {/* Small lines on the page */}
            <div className="pt-1 px-1 space-y-0.5">
              <div className="w-3 h-0.5 bg-gray-300 rounded"></div>
              <div className="w-4 h-0.5 bg-gray-300 rounded"></div>
              <div className="w-2 h-0.5 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Paper plane flying animation - for publishing articles
export const PaperPlane: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <div className="relative w-8 h-8">
        {/* Flight trail */}
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-blue-300 to-transparent absolute top-4 animate-fly-trail"></div>
        </div>

        {/* Paper plane */}
        <div className="absolute w-6 h-6 animate-fly-plane">
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-blue-500">
            <path
              d="M20.33 3.66996C20.1408 3.48213 19.9035 3.35008 19.6442 3.28833C19.3849 3.22659 19.1135 3.23753 18.86 3.31996L4.23 8.19996C3.95 8.29996 3.7 8.49996 3.53 8.76996C3.36 9.03996 3.3 9.35996 3.36 9.65996C3.42 9.95996 3.6 10.22 3.86 10.39C4.12 10.56 4.44 10.62 4.74 10.56L9.3 9.49996L14.8 15L13.74 19.56C13.68 19.86 13.74 20.18 13.91 20.44C14.08 20.7 14.34 20.88 14.64 20.94C14.73 20.96 14.82 20.97 14.91 20.97C15.16 20.97 15.41 20.89 15.62 20.74C15.83 20.59 15.99 20.37 16.08 20.12L20.96 5.49996C21.0323 5.24547 21.0354 4.97715 20.9688 4.72193C20.9023 4.46671 20.7687 4.23423 20.58 4.04996L20.33 3.66996Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

// Heartbeat animation - for like operations
export const HeartBeat: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <div className="relative">
        {/* Main heart */}
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-red-500 animate-heartbeat">
          <path
            fill="currentColor"
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        </svg>

        {/* Small hearts floating away */}
        <div className="absolute -top-1 -right-1">
          <svg viewBox="0 0 24 24" className="w-2 h-2 text-pink-400 animate-float-up">
            <path
              fill="currentColor"
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

// Treasure box opening animation - for favorite/unfavorite
export const TreasureBox: React.FC<{ isOpen?: boolean; className?: string }> = ({
  isOpen = false,
  className = ''
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <div className="relative w-6 h-6">
        {/* Treasure box bottom */}
        <div className="absolute bottom-0 w-6 h-4 bg-gradient-to-r from-amber-600 to-amber-700 rounded-sm"></div>

        {/* Treasure box lid */}
        <div className={`absolute top-0 w-6 h-3 bg-gradient-to-r from-amber-700 to-amber-800 rounded-t-sm transition-transform duration-300 transform-gpu origin-bottom ${
          isOpen ? '-rotate-45 translate-y-1' : ''
        }`}>
          {/* Lock clasp */}
          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full"></div>
        </div>

        {/* Glow when treasure box opens */}
        {isOpen && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
            <div className="w-4 h-2 bg-gradient-to-t from-yellow-200 to-transparent opacity-70 animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
};