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
          ? `w-[86px] h-[38px] rounded-[50px] border border-solid justify-center gap-[10px] px-[15px] py-2 ${
              isLiked
                ? 'bg-[#E19F1D] border-[#E19F1D]'
                : 'bg-[#e19e1d1a] border-[#E19F1D]'
            }`
          : `hover:bg-gray-100 group/like z-10 relative ${currentSize.container}`
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      aria-label={`${isLiked ? '取消点赞' : '点赞'}，当前${likesCount}个赞`}
      title={isLiked ? '取消点赞' : '点赞这篇文章'}
    >
      <div className="relative">
        {/* 宝石图标 - 直接处理颜色变化 */}
        <img
          className={`
            transition-all duration-200 relative z-10
            ${currentSize.icon}
            ${size === 'large'
              ? (isLiked ? 'filter brightness-0 invert' : '')
              : `group-hover/like:scale-110 ${
                  isLiked
                    ? 'filter brightness-0 saturate-200 hue-rotate-45deg transform scale-110 drop-shadow-md'
                    : 'opacity-60 hover:opacity-100'
                }`
            }
          `}
          alt="Treasure icon"
          src="https://c.animaapp.com/mft5gmofxQLTNf/img/treasure-icon.svg"
          style={
            size !== 'large' && isLiked ? {
              filter: 'brightness(0) saturate(100%) invert(57%) sepia(85%) saturate(1274%) hue-rotate(18deg) brightness(92%) contrast(89%)'
            } : undefined
          }
        />
      </div>

      {/* 点赞数量文字 */}
      <span
        className={`
          [font-family:'Lato',Helvetica] font-normal text-center tracking-[0] leading-[20.8px]
          ${currentSize.text}
          ${size === 'large'
            ? (isLiked ? 'text-white' : 'text-[#454545]')
            : 'text-dark-grey'
          }
          transition-colors duration-200
        `}
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