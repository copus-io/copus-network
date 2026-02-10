import React from 'react';
import { useUser } from '../../contexts/UserContext';

interface SocialLinksDisplayProps {
  /** 显示模式 */
  mode?: 'horizontal' | 'vertical';
  /** 自定义样式类名 */
  className?: string;
  /** 是否显示标题 */
  showTitle?: boolean;
  /** 最大显示数量 */
  maxCount?: number;
}

export const SocialLinksDisplay: React.FC<SocialLinksDisplayProps> = ({
  mode = 'horizontal',
  className = '',
  showTitle = true,
  maxCount
}) => {
  const { socialLinks, socialLinksLoading } = useUser();

  // 处理数据
  const displayLinks = maxCount ? socialLinks.slice(0, maxCount) : socialLinks;
  const hasMoreLinks = maxCount && socialLinks.length > maxCount;

  // 打开链接
  const openLink = (url: string) => {
    // 确保链接是完整的URL
    let fullUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      fullUrl = `https://${url}`;
    }
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  if (socialLinksLoading) {
    return (
      <div className={`${className}`}>
        {showTitle && (
          <h4 className="text-sm font-medium text-gray-700 mb-3">Social links</h4>
        )}
        <div className="animate-pulse flex space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-8 h-8 bg-gray-200 rounded-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (displayLinks.length === 0) {
    return null; // 没有链接时不显示
  }

  return (
    <div className={`${className}`}>
      {showTitle && (
        <h4 className="text-sm font-medium text-gray-700 mb-3">社交链接</h4>
      )}

      <div className={`
        ${mode === 'horizontal'
          ? 'flex items-center space-x-3'
          : 'space-y-2'
        }
      `}>
        {displayLinks.map((link) => (
          <button
            key={link.id}
            onClick={() => openLink(link.linkUrl)}
            className={`
              group transition-all duration-200 hover:scale-110
              ${mode === 'horizontal'
                ? 'w-8 h-8 rounded-full'
                : 'flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50'
              }
            `}
            title={`Visit ${link.title}: ${link.linkUrl}`}
          >
            <img
              src={link.iconUrl}
              alt={link.title}
              className={`
                ${mode === 'horizontal' ? 'w-8 h-8' : 'w-5 h-5'}
                rounded-full group-hover:shadow-lg transition-shadow
              `}
              onError={(e) => {
                // 备用图标
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDEzYTUgNSAwIDAgMCA3LjU0LjU0bDMtM2E1IDUgMCAwIDAtNy4wNy03LjA3bC0xLjcyIDEuNzEiIHN0cm9rZT0iIzZiNzI4MCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0ibTE0IDExYTUgNSAwIDAgMC03LjU0LS41NGwtMy0zYTUgNSAwIDAgMCA3LjA3LTcuMDdsMS43MS0xLjcxIiBzdHJva2U9IiM2YjcyODAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
              }}
            />
            {mode === 'vertical' && (
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                {link.title}
              </span>
            )}
          </button>
        ))}

        {hasMoreLinks && (
          <span className="text-xs text-gray-500">
            +{socialLinks.length - maxCount!} more
          </span>
        )}
      </div>
    </div>
  );
};