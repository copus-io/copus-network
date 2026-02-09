import React from 'react';
import { useNavigate } from 'react-router-dom';

interface NoAccessPermissionProps {
  className?: string;
  message?: string;
  onBackToHome?: () => void;
}

export const NoAccessPermission: React.FC<NoAccessPermissionProps> = ({
  className = "",
  message = "该作品为作者私享内容，仅作者本人可查看",
  onBackToHome
}) => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    if (onBackToHome) {
      onBackToHome();
    } else {
      navigate('/');
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-[60vh] px-6 py-12 ${className}`}>
      <div className="flex flex-col items-center max-w-md text-center space-y-6">
        {/* Lock Icon */}
        <div className="relative">
          <div className="w-20 h-20 bg-red/10 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 616 0z" clipRule="evenodd" />
            </svg>
          </div>
          {/* Additional visual effect */}
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red/20 rounded-full flex items-center justify-center">
            <span className="text-red text-xs">🔒</span>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            无权限访问
          </h1>
          <p className="text-lg text-red font-medium">
            {message}
          </p>
        </div>

        {/* Description */}
        <div className="space-y-3 text-gray-600">
          <p className="text-base leading-relaxed">
            私享作品只有作者本人可以查看和管理，不会出现在公共动态和搜索结果中。
          </p>
          <p className="text-sm text-gray-500">
            如果您是作者，请先登录您的账户。
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full mt-8">
          <button
            onClick={handleBackToHome}
            className="flex-1 bg-red hover:bg-red/90 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red focus:ring-offset-2"
          >
            返回首页
          </button>

          <button
            onClick={() => window.history.back()}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            返回上页
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 leading-relaxed">
            💡 <strong>了解私享功能：</strong>作者可以将作品设为私享状态，这样只有自己能够查看和管理，为个人内容管理提供更多隐私保护。
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoAccessPermission;