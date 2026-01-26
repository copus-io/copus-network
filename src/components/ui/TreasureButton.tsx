import React, { useState } from 'react';

interface TreasureButtonProps {
  isLiked: boolean;
  likesCount: number;
  onClick: (e: React.MouseEvent) => void;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  disabled?: boolean;
}

export const TreasureButton: React.FC<TreasureButtonProps> = ({
  isLiked,
  likesCount,
  onClick,
  size = 'medium',
  className = '',
  disabled = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Set styles based on size
  const sizeStyles = {
    small: {
      container: 'gap-1 p-1',
      icon: 'w-[10px] h-[14px]',
      text: 'text-[12px]',
      background: 'w-[10px] h-[14px]'
    },
    medium: {
      container: 'gap-1.5 p-1',
      icon: 'w-[11px] h-4',
      text: 'text-[13px]',
      background: 'w-[11px] h-4'
    },
    large: {
      container: 'gap-[10px] px-[15px] py-2',
      icon: 'w-[18px] h-[22px]',
      text: 'text-lg',
      background: 'w-[18px] h-[22px]'
    }
  };

  const currentSize = sizeStyles[size];

  // Format number display
  const formatCount = (count: number | undefined): string => {
    const safeCount = count || 0;
    if (safeCount >= 1000000) {
      return Math.floor(safeCount / 1000000) + 'M';
    }
    if (safeCount >= 1000) {
      return Math.floor(safeCount / 1000) + 'K';
    }
    return safeCount.toString();
  };

  // Get background color for large size button - use light transparent yellow for both hover and liked states
  const largeButtonBg = (isLiked || isHovered)
    ? 'rgba(225, 158, 29, 0.2)'
    : 'white';

  return (
    <button
      className={`
        inline-flex items-center transition-all duration-200 group
        ${size === 'large'
          ? 'h-[38px] rounded-[100px] gap-1.5 lg:gap-[10px] px-3 lg:px-5 py-2 border border-solid border-[#e19e1d]'
          : `rounded-lg hover:bg-gray-100 ${currentSize.container}`
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={size === 'large' ? {
        backgroundColor: largeButtonBg,
        transition: 'background-color 200ms ease'
      } : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      aria-label={`${isLiked ? 'Remove from treasury' : 'Add to treasury'}, ${likesCount} treasures`}
      title={isLiked ? 'Remove from your treasury' : 'Add to your treasury'}
    >
      <div className="relative">
        {/* Gem icon - different styles for different sizes */}
        <img
          className={`
            transition-all duration-200 relative z-10
            ${currentSize.icon}
            ${isLiked && size !== 'large' ? 'transform scale-110' : ''}
            ${size === 'large' && isLiked ? 'transform scale-110' : ''}
          `}
          alt="Treasure icon"
          src="https://c.animaapp.com/mft5gmofxQLTNf/img/treasure-icon.svg"
          style={
            size === 'large' ? {
              // Always use yellow icon for large size (both liked and not liked)
              filter: 'brightness(0) saturate(100%) invert(57%) sepia(85%) saturate(1274%) hue-rotate(18deg) brightness(92%) contrast(89%)'
            } : (isLiked ? {
              filter: 'brightness(0) saturate(100%) invert(57%) sepia(85%) saturate(1274%) hue-rotate(18deg) brightness(92%) contrast(89%)'
            } : {
              filter: 'brightness(0) saturate(100%) invert(44%) sepia(0%) saturate(0%) hue-rotate(186deg) brightness(94%) contrast(88%)'
            })
          }
        />
        {/* Yellow hover overlay for small/medium sizes */}
        {size !== 'large' && !isLiked && (
          <img
            className={`
              absolute top-0 left-0 transition-opacity duration-200 opacity-0 hover:opacity-100 z-20
              ${currentSize.icon}
            `}
            alt="Treasure icon hover"
            src="https://c.animaapp.com/mft5gmofxQLTNf/img/treasure-icon.svg"
            style={{
              filter: 'brightness(0) saturate(100%) invert(57%) sepia(85%) saturate(1274%) hue-rotate(18deg) brightness(92%) contrast(89%)'
            }}
          />
        )}
      </div>

      {/* Like count text */}
      <span
        className={`
          [font-family:'Lato',Helvetica] font-bold text-center tracking-[0] leading-[16px]
          ${currentSize.text}
          ${size === 'large'
            ? 'text-[#e19e1d]'
            : 'text-[#696969]'
          }
          transition-colors duration-200
        `}
      >
        {formatCount(likesCount)}
      </span>
    </button>
  );
};

// Export commonly used size components with default configuration
export const SmallTreasureButton: React.FC<Omit<TreasureButtonProps, 'size'>> = (props) => (
  <TreasureButton {...props} size="small" />
);

export const MediumTreasureButton: React.FC<Omit<TreasureButtonProps, 'size'>> = (props) => (
  <TreasureButton {...props} size="medium" />
);

export const LargeTreasureButton: React.FC<Omit<TreasureButtonProps, 'size'>> = (props) => (
  <TreasureButton {...props} size="large" />
);
