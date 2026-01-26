import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCard } from '@/components/ui/UserCard';
import { getCategoryStyle, getCategoryInlineStyle } from '@/utils/categoryStyles';
import { ArticleDetailResponse } from '@/types/article';
import profileDefaultAvatar from '@/assets/images/profile-default.svg';
import { SpaceData } from '@/components/ui/TreasuryCard';

// 🔍 SEARCH: content-header-props
interface ContentHeaderProps {
  article: ArticleDetailResponse;
  userSpaces: SpaceData[];
}

// Helper function to get valid detail image URL
const getValidDetailImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl || imageUrl.trim() === '') {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjMyMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
  }

  // Check if it's a blob URL (from file upload) - these URLs don't work in new sessions
  if (imageUrl.startsWith('blob:')) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjMyMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5VcGxvYWRlZCBJbWFnZTwvdGV4dD48L3N2Zz4=';
  }

  // Fix malformed extensions like '.svg+xml' -> '.svg'
  if (imageUrl.endsWith('+xml')) {
    imageUrl = imageUrl.replace(/\+xml$/, '');
  }

  // Check if it's a valid HTTP/HTTPS URL
  try {
    const url = new URL(imageUrl);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return imageUrl;
    } else {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjMyMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbnZhbGlkIFVSTDwvdGV4dD48L3N2Zz4=';
    }
  } catch (error) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjMyMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbnZhbGlkIFVSTDwvdGV4dD48L3N2Zz4=';
  }
};

// 🔍 SEARCH: content-header-component
export const ContentHeader: React.FC<ContentHeaderProps> = ({
  article,
  userSpaces
}) => {
  const validImageUrl = getValidDetailImageUrl(article.detailCover);
  const categoryStyle = getCategoryStyle(article.category);
  const categoryInlineStyle = getCategoryInlineStyle(article.category);

  return (
    <>
      {/* Article Header Image */}
      {validImageUrl && (
        <div className="w-full max-w-[800px] mx-auto mb-8">
          <img
            src={validImageUrl}
            alt={article.title || 'Article cover'}
            className="w-full h-auto max-h-[320px] object-cover rounded-lg shadow-sm"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjMyMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBGYWlsZWQgdG8gTG9hZDwvdGV4dD48L3N2Zz4=';
            }}
          />
        </div>
      )}

      {/* Article Title and Category */}
      <div className="mb-6">
        {article.category && (
          <Badge
            className={`mb-3 ${categoryStyle.badge}`}
            style={categoryInlineStyle.badge}
          >
            {article.category}
          </Badge>
        )}

        <h1 className="text-2xl lg:text-3xl font-bold text-[#1a1a1a] mb-4 leading-tight">
          {article.title}
        </h1>
      </div>

      {/* Author Information */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <UserCard
            username={article.user?.username || 'Anonymous'}
            namespace={article.user?.namespace || ''}
            profileFaceUrl={article.user?.faceUrl || profileDefaultAvatar}
            spaces={userSpaces}
            showSpacesOnHover={true}
            size="medium"
            showFollowButton={true}
            userId={article.user?.id}
          />

          <div className="text-right text-sm text-gray-600">
            <div className="mb-1">
              {new Date(article.createAt * 1000).toLocaleDateString()}
            </div>
            <div className="flex items-center space-x-4 text-xs">
              <span>{article.likeCount || 0} treasures</span>
              <span>{article.viewCount || 0} visits</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};