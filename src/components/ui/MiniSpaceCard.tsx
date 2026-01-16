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

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md ${
        onClick ? 'cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-all duration-200' : ''
      }`}
      onClick={onClick}
    >
      {/* 空间类型图标 */}
      <div className="flex-shrink-0 w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
          {space.spaceType === 2 ? (
            // Curations图标
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          ) : (
            // Treasury图标
            <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zM3 13a1 1 0 011-1h1a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          )}
        </svg>
      </div>

      {/* 空间信息 */}
      <div className="flex-1 min-w-0">
        <h4 className="[font-family:'Lato',Helvetica] text-xs font-medium text-gray-900 truncate">
          {title}
        </h4>
        {space.description ? (
          <p className="[font-family:'Lato',Helvetica] text-[10px] text-gray-500 truncate">
            {space.description}
          </p>
        ) : (
          <p className="[font-family:'Lato',Helvetica] text-[10px] text-gray-500 truncate">
            {treasureCount} {treasureCount === 1 ? 'item' : 'items'}
          </p>
        )}
      </div>

      {/* 右箭头 */}
      <svg className="flex-shrink-0 w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
};

export default MiniSpaceCard;