import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from './card';
import { MiniSpaceCard } from './MiniSpaceCard';
import { SpaceData } from './TreasuryCard';

interface UserCardProps {
  userId: number;
  userName: string;
  userNamespace?: string;
  userAvatar: string;
  userBio?: string;
  userSpaces?: SpaceData[];
  children: React.ReactNode;
  onUserClick: () => void;
  onSpaceClick?: (space: SpaceData) => void;
  delay?: number;
  hideDelay?: number;
}

export const UserCard: React.FC<UserCardProps> = ({
  userId,
  userName,
  userNamespace,
  userAvatar,
  userBio,
  userSpaces = [],
  children,
  onUserClick,
  onSpaceClick,
  delay = 500,
  hideDelay = 300,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const showTimeoutRef = useRef<NodeJS.Timeout>();
  const hideTimeoutRef = useRef<NodeJS.Timeout>();
  const triggerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const clearTimeouts = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
  }, []);

  const calculatePosition = useCallback((rect: DOMRect) => {
    const x = rect.right + 5;
    const y = rect.top;
    const cardWidth = 320;
    const cardHeight = 200;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    // 如果右侧空间不够，显示在左侧
    if (x + cardWidth > viewportWidth) {
      adjustedX = rect.left - cardWidth - 5;
    }

    // 如果下方空间不够，向上调整
    if (y + cardHeight > viewportHeight) {
      adjustedY = Math.max(10, viewportHeight - cardHeight - 10);
    }

    return { x: adjustedX, y: adjustedY };
  }, []);

  const handleMouseEnter = useCallback((event: React.MouseEvent) => {
    clearTimeouts();

    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      setPosition(calculatePosition(rect));
    }

    showTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  }, [clearTimeouts, calculatePosition, delay]);

  const handleMouseLeave = useCallback(() => {
    clearTimeouts();
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, hideDelay);
  }, [clearTimeouts, hideDelay]);

  const handleCardMouseEnter = useCallback(() => {
    clearTimeouts();
    setIsVisible(true);
  }, [clearTimeouts]);

  const handleCardMouseLeave = useCallback(() => {
    clearTimeouts();
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, hideDelay);
  }, [clearTimeouts, hideDelay]);

  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, []);

  const handleCardUserClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(false);
    onUserClick();
  }, [onUserClick]);

  // 优化空间显示逻辑
  const displayedSpaces = useMemo(() => userSpaces?.slice(0, 3) || [], [userSpaces]);
  const hasMoreSpaces = useMemo(() => (userSpaces?.length || 0) > 3, [userSpaces]);

  return (
    <div className="relative inline-block">
      {/* 触发元素 */}
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>

      {/* 名片弹窗 */}
      {isVisible && (
        <div
          className="absolute z-50 pointer-events-auto left-0 top-full mt-2"
        >
          <Card
            ref={cardRef}
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
            className="w-80 bg-white border border-gray-200 shadow-lg animate-in fade-in-0 zoom-in-95 duration-200"
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* 用户头像 */}
                <img
                  src={userAvatar}
                  alt={`${userName}'s avatar`}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0 cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={handleCardUserClick}
                />

                <div className="flex-1 min-w-0">
                  {/* 用户名和namespace */}
                  <div className="flex items-center gap-2 mb-1">
                    <h4
                      className="[font-family:'Lato',Helvetica] font-semibold text-gray-900 text-base cursor-pointer hover:text-blue-600 transition-colors duration-200 truncate"
                      onClick={handleCardUserClick}
                      title={userName}
                    >
                      {userName}
                    </h4>
                    {userNamespace && (
                      <span className="[font-family:'Lato',Helvetica] text-gray-500 text-sm truncate">
                        @{userNamespace}
                      </span>
                    )}
                  </div>

                  {/* 用户简介 */}
                  {userBio && userBio.trim() && (
                    <p className="[font-family:'Lato',Helvetica] text-gray-600 text-sm leading-snug overflow-hidden"
                       style={{
                         display: '-webkit-box',
                         WebkitLineClamp: 2,
                         WebkitBoxOrient: 'vertical'
                       }}>
                      {userBio}
                    </p>
                  )}
                </div>
              </div>

              {/* 用户空间列表 - 横向排列 */}
              {userSpaces && userSpaces.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="[font-family:'Lato',Helvetica] text-xs font-medium text-gray-700">
                      Treasuries ({userSpaces.length})
                    </span>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {displayedSpaces.map((space, index) => (
                      <div key={space.id || index} className="flex-1 min-w-0">
                        <MiniSpaceCard
                          space={space}
                          onClick={() => {
                            setIsVisible(false);
                            onSpaceClick?.(space);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  {hasMoreSpaces && (
                    <div className="text-center mt-1">
                      <span className="[font-family:'Lato',Helvetica] text-xs text-gray-500">
                        +{(userSpaces?.length || 0) - 3} more
                      </span>
                    </div>
                  )}
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UserCard;