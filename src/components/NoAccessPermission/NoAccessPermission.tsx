import React from 'react';
import { Link } from 'react-router-dom';

interface NoAccessPermissionProps {
  className?: string;
  message?: string;
  onBackToHome?: () => void;
}

export const NoAccessPermission: React.FC<NoAccessPermissionProps> = ({
  className = "",
  message = "This content is private and only visible to the author.",
  onBackToHome
}) => {
  return (
    <div className={`text-center p-8 max-w-md ${className}`}>
      {/* Lock Icon - matching the existing error page style */}
      <div className="mb-6">
        <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        This Work is Private
      </h1>

      {/* Message */}
      <p className="text-gray-600 mb-6">
        {message} If you believe you should have access, please contact the author directly.
      </p>

      {/* Action Buttons - matching existing style */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/"
          className="px-6 py-3 bg-red text-white rounded-full hover:bg-red/90 transition-colors font-medium"
        >
          Explore More Content
        </Link>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors font-button"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};

export default NoAccessPermission;