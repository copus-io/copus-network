import React from 'react';
import { SpaceData, getSpaceDisplayName, getSpaceTreasureCount, transformSpaceToItems } from './TreasuryCard';
import { SPACE_VISIBILITY } from '../../types/space';

interface MiniSpaceCardProps {
  space: SpaceData;
  onClick?: () => void;
}

/**
 * MiniSpaceCard Component
 * 用于在用户名片中显示的简化版空间卡片 - 紧凑横向设计
 */
export const MiniSpaceCard: React.FC<MiniSpaceCardProps> = ({ space, onClick }) => {
  const title = getSpaceDisplayName(space);
  const treasureCount = getSpaceTreasureCount(space);

  // Check if space is private
  const isPrivateSpace = space.visibility === SPACE_VISIBILITY.PRIVATE;

  // Get cover image: use first article's cover image for all space types
  const firstArticleCover = space.data?.[0]?.coverUrl || '';
  const coverImage = firstArticleCover || space.coverUrl || '';

  // First letter fallback
  const firstLetter = title.charAt(0).toUpperCase();

  return (
    <div
      className={`relative flex items-center gap-2 px-2 py-1.5 rounded-md ${
        isPrivateSpace
          ? 'bg-red/5 border border-red/20 hover:bg-red/8 hover:border-red/30'
          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
      } ${onClick ? 'cursor-pointer transition-all duration-200' : ''}`}
      onClick={onClick}
    >
      {/* 空间封面图 */}
      {coverImage ? (
        <img
          src={coverImage}
          alt={title}
          className="flex-shrink-0 w-8 h-8 rounded object-cover"
        />
      ) : (
        <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
          <span className="text-sm font-medium text-gray-600">
            {firstLetter}
          </span>
        </div>
      )}

      {/* 空间信息 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <h4 className="[font-family:'Lato',Helvetica] text-xs font-medium text-gray-900 truncate">
            {title}
          </h4>
          {isPrivateSpace && (
            <svg className="w-2.5 h-2.5 text-red flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <p className="[font-family:'Lato',Helvetica] text-[10px] text-gray-500 truncate">
          {treasureCount} {treasureCount === 1 ? 'item' : 'items'}
        </p>
      </div>

      {/* 右箭头 */}
      <svg className="flex-shrink-0 w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
};

export default MiniSpaceCard;