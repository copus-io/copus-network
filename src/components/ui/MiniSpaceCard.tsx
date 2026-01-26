import React from 'react';
import { SpaceData, getSpaceDisplayName, getSpaceTreasureCount, transformSpaceToItems } from './TreasuryCard';

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

  // Get cover image: use first article's cover image for all space types
  const firstArticleCover = space.data?.[0]?.coverUrl || '';
  const coverImage = firstArticleCover || space.coverUrl || '';

  // First letter fallback
  const firstLetter = title.charAt(0).toUpperCase();

  return (
    <div
      className={`flex items-center gap-2 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md ${
        onClick ? 'cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-all duration-200' : ''
      }`}
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
        <h4 className="[font-family:'Lato',Helvetica] text-xs font-medium text-gray-900 truncate">
          {title}
        </h4>
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