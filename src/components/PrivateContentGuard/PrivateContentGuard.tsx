import React from 'react';
import { useUser } from '../../contexts/UserContext';
import { Link } from 'react-router-dom';
import { canUserViewArticle, isArticlePrivate, ARTICLE_VISIBILITY } from '../../types/article';

interface PrivateContentGuardProps {
  article: {
    isPrivate?: boolean; // Legacy support
    visibility?: number; // New visibility field
    userId?: number;
    userName?: string;
    title?: string;
    authorInfo?: { id: number }; // New API structure
  };
  children: React.ReactNode;
}

interface PrivateContentPlaceholderProps {
  authorName?: string;
  title?: string;
}

const PrivateContentPlaceholder: React.FC<PrivateContentPlaceholderProps> = ({
  authorName,
  title
}) => {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <div className="flex flex-col items-center gap-8 max-w-lg text-center bg-white rounded-3xl shadow-xl p-8">
          {/* Lock Icon with gradient background */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red/10 to-red/20 flex items-center justify-center relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red/20 to-red/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-red" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Main Message */}
          <div className="flex flex-col gap-3">
            <h2 className="[font-family:'Lato',Helvetica] font-bold text-dark-grey text-3xl tracking-[0] leading-tight flex items-center justify-center gap-3">
              <span className="text-2xl">🔒</span>
              这是一篇私享作品
            </h2>
            <p className="[font-family:'Lato',Helvetica] font-normal text-medium-grey text-lg tracking-[0] leading-relaxed">
              {title && `"${title}"${authorName ? ` 由 ${authorName}` : ''} 创作，仅作者可见`}
            </p>
            <div className="w-16 h-0.5 bg-gradient-to-r from-red/20 to-red/50 mx-auto mt-2"></div>
          </div>

          {/* Suggested Actions */}
          <div className="flex flex-col gap-4 w-full">
            <Link
              to="/discovery"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-red to-red/90 rounded-2xl text-white font-semibold hover:from-red/90 hover:to-red/80 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              浏览公开作品
            </Link>

            <Link
              to="/"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-700 font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.02]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              返回首页
            </Link>
          </div>

          {/* Additional Info */}
          <div className="bg-gray-50 rounded-xl p-4 mt-4 w-full">
            <p className="text-gray-600 text-sm mb-2">想要分享你的内容？</p>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 text-red hover:text-red/80 font-medium transition-colors"
            >
              创建你的第一篇作品
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PrivateContentGuard: React.FC<PrivateContentGuardProps> = ({
  article,
  children
}) => {
  const { user } = useUser();

  // Check if user can view the article using new visibility system or legacy isPrivate
  let canView = true;

  if (article.visibility !== undefined) {
    // Use new visibility system
    canView = canUserViewArticle(article, user?.id);
  } else if (article.isPrivate !== undefined) {
    // Fallback to legacy isPrivate system
    const isPrivate = article.isPrivate || false;
    const isAuthor = user?.id === (article.userId || article.authorInfo?.id);
    canView = !isPrivate || isAuthor;
  }

  if (!canView) {
    return (
      <PrivateContentPlaceholder
        authorName={article.userName}
        title={article.title}
      />
    );
  }

  return <>{children}</>;
};

export default PrivateContentGuard;