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
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return Math.floor(count / 1000000) + 'M';
    }
    if (count >= 1000) {
      return Math.floor(count / 1000) + 'K';
    }
    return count.toString();
  };

  return (
    <button
      className={`
        inline-flex items-center transition-all duration-200 rounded-lg
        ${size === 'large'
          ? `h-[38px] rounded-[50px] gap-[10px] pr-[15px] py-2`
          : `hover:bg-gray-100 ${currentSize.container}`
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
        {/* 宝石图标 - 直接处理颜色变化 */}
        <img
          className={`
            transition-all duration-200 relative z-10
            ${currentSize.icon}
            ${isLiked
              ? 'filter brightness-0 saturate-200 hue-rotate-45deg transform scale-110 drop-shadow-md'
              : 'opacity-60 hover:opacity-100 hover:scale-110'
            }
          `}
          alt="Treasure icon"
          src="https://c.animaapp.com/mft5gmofxQLTNf/img/treasure-icon.svg"
          style={
            isLiked ? {
              filter: 'brightness(0) saturate(100%) invert(57%) sepia(85%) saturate(1274%) hue-rotate(18deg) brightness(92%) contrast(89%)'
            } : undefined
          }
        />
        {/* 黄色悬停效果叠加层 */}
        {size === 'large' && !isLiked && (
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
          text-dark-grey
          transition-colors duration-200
        `}
        style={{ fontSize: '1.125rem' }}
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