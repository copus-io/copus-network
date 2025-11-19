import React from 'react';

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
  // 根据尺寸设置样式
  const sizeStyles = {
    small: {
      container: 'gap-1 p-1',
      icon: 'w-[11px] h-4',
      text: 'text-sm',
      background: 'w-[11px] h-4'
    },
    medium: {
      container: 'gap-2 p-1',
      icon: 'w-[13px] h-5',
      text: 'text-base',
      background: 'w-[13px] h-5'
    },
    large: {
      container: 'gap-[10px] px-[15px] py-2',
      icon: 'w-3.5 h-[22px]',
      text: 'text-lg',
      background: 'w-3.5 h-[22px]'
    }
  };

  const currentSize = sizeStyles[size];

  // 格式化数字显示
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

  return (
    <button
      className={`
        inline-flex items-center transition-all duration-200 group
        ${size === 'large'
          ? `h-[38px] rounded-[100px] gap-[10px] px-5 py-2 border border-solid border-[#e19e1d] hover:bg-[#e19e1d] ${isLiked ? 'bg-[#e19e1d]' : 'bg-white'}`
          : `rounded-lg hover:bg-gray-100 ${currentSize.container}`
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      aria-label={`${isLiked ? 'Remove from treasury' : 'Add to treasury'}, ${likesCount} treasures`}
      title={isLiked ? 'Remove from your treasury' : 'Add to your treasury'}
    >
      <div className="relative">
        {/* 宝石图标 - different styles for different sizes */}
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
              filter: isLiked
                ? 'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(103%) contrast(103%)'
                : 'brightness(0) saturate(100%) invert(57%) sepia(85%) saturate(1274%) hue-rotate(18deg) brightness(92%) contrast(89%)'
            } : (isLiked ? {
              filter: 'brightness(0) saturate(100%) invert(57%) sepia(85%) saturate(1274%) hue-rotate(18deg) brightness(92%) contrast(89%)'
            } : {
              filter: 'brightness(0) saturate(100%) invert(44%) sepia(0%) saturate(0%) hue-rotate(186deg) brightness(94%) contrast(88%)'
            })
          }
        />
        {/* White icon overlay for hover effect - only for large size */}
        {size === 'large' && !isLiked && (
          <img
            className={`
              absolute top-0 left-0 transition-opacity duration-200 opacity-0 group-hover:opacity-100 z-20
              ${currentSize.icon}
            `}
            alt="Treasure icon hover"
            src="https://c.animaapp.com/mft5gmofxQLTNf/img/treasure-icon.svg"
            style={{
              filter: 'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(103%) contrast(103%)'
            }}
          />
        )}
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

      {/* 点赞数量文字 */}
      <span
        className={`
          [font-family:'Lato',Helvetica] font-normal text-center tracking-[0] leading-[20.8px]
          ${currentSize.text}
          ${size === 'large'
            ? (isLiked ? 'text-white group-hover:text-white' : 'text-[#e19e1d] group-hover:text-white')
            : 'text-[#696969]'
          }
          transition-colors duration-200
        `}
        style={{ fontSize: '1rem' }}
      >
        {formatCount(likesCount)}
      </span>
    </button>
  );
};

// 导出默认配置的常用尺寸组件
export const SmallTreasureButton: React.FC<Omit<TreasureButtonProps, 'size'>> = (props) => (
  <TreasureButton {...props} size="small" />
);

export const MediumTreasureButton: React.FC<Omit<TreasureButtonProps, 'size'>> = (props) => (
  <TreasureButton {...props} size="medium" />
);

export const LargeTreasureButton: React.FC<Omit<TreasureButtonProps, 'size'>> = (props) => (
  <TreasureButton {...props} size="large" />
);