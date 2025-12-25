import React, { useEffect } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../components/ui/avatar";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";
import { useNotification } from "../../../../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";

const notificationTabs = [
  { value: "all", label: "All" },
  { value: "system", label: "System" },
  { value: "treasury", label: "Treasury" },
];

export const NotificationListSection = (): JSX.Element => {
  const navigate = useNavigate();
  const {
    notifications: contextNotifications,
    isLoading,
    isLoadingMore,
    hasMore,
    fetchNotifications,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotification();

  // Fetch notification list on page load - add delay to avoid resource conflicts
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotifications();
    }, 500);

    return () => clearTimeout(timer);
  }, []); // Remove fetchNotifications dependency, only execute on first component load

  // Infinite scroll effect with scroll position preservation
  useEffect(() => {
    const handleScroll = async () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrolledToBottom = scrollTop + windowHeight >= documentHeight - 1000; // Trigger 1000px early

      if (scrolledToBottom && hasMore && !isLoading && !isLoadingMore) {
        // Save current scroll position before loading more
        const currentScrollPosition = window.scrollY;
        console.log('[Notification] Loading more notifications, scroll position:', currentScrollPosition);

        try {
          await loadMoreNotifications();

          // Restore scroll position after loading to prevent jumping to top
          setTimeout(() => {
            if (Math.abs(window.scrollY - currentScrollPosition) > 100) {
              window.scrollTo(0, currentScrollPosition);
              console.log('[Notification] Restored scroll position after pagination load');
            }
          }, 50);
        } catch (error) {
          console.error('Failed to load more notifications:', error);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasMore, isLoading, isLoadingMore, loadMoreNotifications]);

  // Format timestamp with stable calculation to avoid frequent re-renders
  const formatTimestamp = (timestamp: number | string): string => {
    if (!timestamp) return "just now";

    const date = new Date(timestamp);
    const now = Date.now();
    const diffMs = now - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    // Show specific date for over 7 days
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Use real notification data from Context with stable time formatting
  const notificationList = contextNotifications.map(n => ({
    id: parseInt(n.id) || 1,
    type: n.type,
    category: n.type === "system" ? "System" : n.type === "like" ? "Treasure" : n.type === "comment" ? "Comment" : "Treasury",
    message: n.message || n.title,
    timestamp: formatTimestamp(n.timestamp),
    isRead: n.isRead,
    icon: n.type === "system" ? "https://c.animaapp.com/mft4oqz6uyUKY7/img/icon-wrap-1.svg" : undefined,
    profileImage: n.avatar,
    deleteIcon: n.type === "system" ? "https://c.animaapp.com/mft4oqz6uyUKY7/img/delete.svg" : "https://c.animaapp.com/mft4oqz6uyUKY7/img/delete-1.svg",
    userId: n.metadata?.senderId, // Use senderId
    namespace: n.metadata?.senderNamespace, // Add namespace for navigation
    articleId: n.metadata?.targetUuid || n.metadata?.targetId || n.metadata?.articleUuid || n.metadata?.articleId, // Prefer targetUuid for new format
  }));

  // Render empty state component
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 px-5">
      <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-5 5V17zM15 17H9a2 2 0 01-2-2V9a2 2 0 012-2h6v10z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 11l3 3 5-5" />
        </svg>
      </div>
      <h3 className="text-xl font-medium text-gray-800 mb-2">All caught up!</h3>
      <p className="text-gray-500 text-center max-w-sm leading-relaxed">
        No new notifications at the moment.
      </p>
    </div>
  );

  // Render loading state
  const renderLoadingState = () => (
    <div className="flex flex-col gap-5 pb-[30px]">
      {[1, 2, 3].map((index) => (
        <div key={index} className="animate-pulse">
          <div className="flex items-start gap-[30px] p-5 bg-white rounded-lg">
            <div className="w-[45px] h-[45px] bg-gray-200 rounded-full flex-shrink-0"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded mb-2 w-16"></div>
              <div className="h-5 bg-gray-200 rounded mb-1"></div>
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="h-3 bg-gray-200 rounded w-12"></div>
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );


  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead(notification.id.toString());
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteNotification = async (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(id.toString());
  };

  // Handle user click to navigate to profile page
  const handleUserClick = (notification: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering notification card click event

    // Prefer namespace, fallback to userId
    if (notification.namespace) {
      // Use short link format to navigate to user profile page
      navigate(`/u/${notification.namespace}`);
    } else if (notification.userId) {
      // Fallback: use userId
      navigate(`/user/${notification.userId}/treasury`);
    }
  };

  // Parse message with clickable elements in square brackets
  const parseMessageWithLinks = (message: string, notification: any) => {
    // Split message by square brackets pattern: [content]
    const parts = message.split(/(\[[^\]]+\])/g);

    return parts.map((part, index) => {
      // Check if this part is in square brackets
      if (part.startsWith('[') && part.endsWith(']')) {
        const linkText = part.slice(1, -1); // Remove brackets

        // Check if this is a username (first bracket in most messages)
        const isFirstBracket = index === 1; // Usually username is the first bracketed content
        const isUsername = isFirstBracket && (notification.namespace || notification.userId || notification.metadata?.senderUsername === linkText);

        if (isUsername) {
          // This is a username - make it clickable to user profile
          return (
            <span
              key={index}
              className="text-blue-600 hover:text-blue-800 underline cursor-pointer font-medium"
              onClick={(e) => {
                e.stopPropagation();
                const namespace = notification.namespace || notification.metadata?.senderNamespace;
                if (namespace) {
                  navigate(`/u/${namespace}`);
                } else if (notification.userId) {
                  navigate(`/user/${notification.userId}/treasury`);
                }
              }}
              title="Click to view user profile"
            >
              {linkText}
            </span>
          );
        }

        // Determine link type and navigation based on context
        if (notification.type === 'follow') {
          // For follow messages: [空间名] should link to space
          return (
            <span
              key={index}
              className="text-blue-600 hover:text-blue-800 underline cursor-pointer font-medium"
              onClick={(e) => {
                e.stopPropagation();
                // Use spaceNamespace from metadata if available
                const namespace = notification.metadata?.spaceNamespace || notification.namespace;
                if (namespace) {
                  navigate(`/u/${namespace}`);
                }
              }}
              title="Click to view space"
            >
              {linkText}
            </span>
          );
        } else if (notification.type === 'treasury') {
          // For treasury messages: [作品名] should link to work
          return (
            <span
              key={index}
              className="text-blue-600 hover:text-blue-800 underline cursor-pointer font-medium"
              onClick={(e) => {
                e.stopPropagation();
                const articleId = notification.articleId || notification.metadata?.targetUuid || notification.metadata?.targetId;
                if (articleId) {
                  navigate(`/work/${articleId}`);
                }
              }}
              title="Click to view content"
            >
              {linkText}
            </span>
          );
        } else if (notification.type === 'comment_reply' || notification.type === 'comment_like') {
          // For comment messages: [评论内容] - 不需要跳转，只展示评论内容
          // 检查是否是评论内容（通常不是用户名，且在引号内）
          const isCommentContent = linkText.length > 10 || (message.includes(`"${linkText}"`) && !isFirstBracket);

          if (isCommentContent) {
            // 这是评论内容 - 实现两行展示和中间折叠
            return (
              <span key={index} className="text-gray-700 bg-gray-50 px-2 py-1 rounded border inline-block max-w-xs">
                <span className="block overflow-hidden" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  textOverflow: 'ellipsis',
                  lineHeight: '1.4',
                  maxHeight: '2.8em'
                }}>
                  {linkText}
                </span>
              </span>
            );
          } else {
            // 其他内容保持可点击
            return (
              <span
                key={index}
                className="text-blue-600 hover:text-blue-800 underline cursor-pointer font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  const articleId = notification.articleId || notification.metadata?.targetUuid || notification.metadata?.targetId;
                  const commentId = notification.metadata?.commentId;
                  if (articleId) {
                    navigate(`/work/${articleId}${commentId ? `#comment-${commentId}` : '#comments'}`);
                  }
                }}
                title="Click to view comment"
              >
                {linkText}
              </span>
            );
          }
        } else {
          // Default: just make it blue but not necessarily clickable
          return (
            <span key={index} className="text-blue-600 font-medium">
              {linkText}
            </span>
          );
        }
      }

      // Regular text part
      return part;
    });
  };

  return (
    <section className="flex flex-col items-start gap-2.5 py-5 min-h-screen px-5">
      <header className="flex items-start justify-between w-full">
        <h1 className="font-h-3 font-[number:var(--h-3-font-weight)] text-off-black text-[length:var(--h-3-font-size)] tracking-[var(--h-3-letter-spacing)] leading-[var(--h-3-line-height)] [font-style:var(--h-3-font-style)]">
          Notifications
        </h1>

        <Button
          variant="outline"
          className="h-10 gap-3 px-5 py-[15px] rounded-[100px] border-[#686868] font-p font-[number:var(--p-font-weight)] text-dark-grey text-[length:var(--p-font-size)] tracking-[var(--p-letter-spacing)] leading-[var(--p-line-height)] [font-style:var(--p-font-style)] hover:bg-gray-50 transition-colors"
          onClick={handleMarkAllAsRead}
        >
          Mark all as read
        </Button>
      </header>

      <Tabs
        defaultValue="all"
        className="w-full translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]"
      >
        <TabsList className="flex w-full bg-transparent h-auto p-0 gap-0 border-b border-gray-100">
          {notificationTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={`group flex-1 justify-center px-6 py-4 bg-transparent rounded-none border-0 transition-all duration-200 relative hover:bg-gray-50/50 data-[state=active]:bg-transparent data-[state=active]:shadow-none ${
                tab.value === "all"
                  ? "[font-family:'Lato',Helvetica] font-bold text-gray-700 text-lg leading-tight data-[state=active]:text-black"
                  : "font-medium text-gray-600 text-base leading-tight data-[state=active]:text-black"
              }`}
            >
              <span className="relative z-10">{tab.label}</span>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 group-data-[state=active]:w-12 h-0.5 bg-black transition-all duration-300 ease-out"></div>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-5">
          {isLoading ? (
            renderLoadingState()
          ) : notificationList.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="flex flex-col gap-5 pb-[30px]">
              {notificationList.map((notification, index) => {
                const isRead = notification.isRead;

                return (
                  <Card
                    key={notification.id}
                    className={`p-0 border-0 rounded-lg border-b border-white translate-y-[-1rem] animate-fade-in opacity-0 transition-all duration-200 cursor-pointer ${
                      isRead
                        ? "bg-white shadow-none"
                        : "shadow-[1px_1px_10px_#c5c5c5] bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]"
                    }`}
                    style={
                      {
                        "--animation-delay": `${400 + index * 100}ms`,
                      } as React.CSSProperties
                    }
                    onClick={() => handleNotificationClick(notification)}
                  >
                  <CardContent className="flex items-start gap-[30px] p-5">
                    {notification.type === "system" ? (
                      <img
                        className="flex-shrink-0"
                        alt="System notification icon"
                        src={notification.icon}
                      />
                    ) : (
                      <div
                        className={`relative ${(notification.namespace || notification.userId) ? 'cursor-pointer hover:opacity-80 transition-opacity duration-200' : ''}`}
                        onClick={(notification.namespace || notification.userId) ? (e) => handleUserClick(notification, e) : undefined}
                        title={(notification.namespace || notification.userId) ? "Click to view user profile" : undefined}
                      >
                        <Avatar className="w-[45px] h-[45px] flex-shrink-0">
                          <AvatarImage
                            src={notification.profileImage || "data:image/svg+xml,%3csvg%20width='100'%20height='100'%20viewBox='0%200%20100%20100'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20width='100'%20height='100'%20rx='50'%20fill='white'/%3e%3crect%20width='100'%20height='100'%20rx='50'%20fill='%23E0E0E0'%20fill-opacity='0.4'/%3e%3cpath%20d='M73.9643%2060.6618V60.9375C73.9643%2074.2269%2063.2351%2085%2050%2085C36.7649%2085%2026.0357%2074.2269%2026.0357%2060.9375V60.6618C22.2772%2059.6905%2019.5%2056.2646%2019.5%2052.1875C19.5%2048.1104%2022.2772%2044.6845%2026.0357%2043.7132V39.0625C26.0357%2025.7731%2036.7649%2015%2050%2015C63.2351%2015%2073.9643%2025.7731%2073.9643%2039.0625V43.7132C77.7228%2044.6845%2080.5%2048.1104%2080.5%2052.1875C80.5%2056.2646%2077.7228%2059.6905%2073.9643%2060.6618ZM69.6071%2043.4375H67.2192C62.2208%2043.4375%2057.8638%2040.0217%2056.6515%2035.1527L56.5357%2034.6875L48.85%2038.5461C43.0934%2041.4362%2036.8058%2043.0815%2030.3929%2043.3858V60.9375C30.3929%2071.8106%2039.1713%2080.625%2050%2080.625C60.8287%2080.625%2069.6071%2071.8106%2069.6071%2060.9375V43.4375ZM39.1071%2050C39.1071%2048.7919%2040.0825%2047.8125%2041.2857%2047.8125C42.4889%2047.8125%2043.4643%2048.7919%2043.4643%2050V54.375C43.4643%2055.5831%2042.4889%2056.5625%2041.2857%2056.5625C40.0825%2056.5625%2039.1071%2055.5831%2039.1071%2054.375V50ZM56.5357%2050C56.5357%2048.7919%2057.5111%2047.8125%2058.7143%2047.8125C59.9175%2047.8125%2060.8929%2048.7919%2060.8929%2050V54.375C60.8929%2055.5831%2059.9175%2056.5625%2058.7143%2056.5625C57.5111%2056.5625%2056.5357%2055.5831%2056.5357%2054.375V50ZM41.9964%2071.3039C41.1073%2070.4899%2041.0438%2069.1064%2041.8544%2068.2136C42.6651%2067.3209%2044.0431%2067.2571%2044.9321%2068.0711C46.0649%2069.1081%2047.4581%2069.6875%2048.8886%2069.6875C50.3722%2069.6875%2051.7728%2069.1187%2052.8779%2068.0924C53.7612%2067.2721%2055.1396%2067.3261%2055.9565%2068.2131C56.7735%2069.1%2056.7197%2070.484%2055.8364%2071.3043C53.9384%2073.0668%2051.4869%2074.0625%2048.8886%2074.0625C46.3342%2074.0625%2043.907%2073.0532%2041.9964%2071.3039ZM23.8571%2052.1875C23.8571%2053.8069%2024.7334%2055.2207%2026.0357%2055.9772V48.3978C24.7334%2049.1543%2023.8571%2050.5681%2023.8571%2052.1875ZM76.1429%2052.1875C76.1429%2050.5681%2075.2666%2049.1543%2073.9643%2048.3978V55.9772C75.2666%2055.2207%2076.1429%2053.8069%2076.1429%2052.1875Z'%20fill='black'/%3e%3c/svg%3e"}
                            alt="Profile"
                            className="object-cover"
                          />
                          <AvatarFallback>AN</AvatarFallback>
                        </Avatar>
                        {(notification.namespace || notification.userId) && (
                          <div className="absolute inset-0 rounded-full border-2 border-transparent hover:border-blue-300 transition-colors duration-200" />
                        )}
                      </div>
                    )}

                    <div className="flex items-start gap-5 flex-1">
                      <div className="flex flex-col gap-2.5 flex-1">
                        <div className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base leading-[23px]">
                          {notification.category}
                        </div>
                        <div className="[font-family:'Lato',Helvetica] font-medium text-off-black text-lg leading-[23px]">
                          {parseMessageWithLinks(notification.message, notification)}
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-center gap-[5px] flex-shrink-0">
                        <div className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-sm leading-[23px]">
                          {notification.timestamp}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-auto hover:bg-transparent"
                          onClick={(e) => handleDeleteNotification(notification.id, e)}
                        >
                          <img
                            className={
                              notification.type === "system" ? "h-[35px]" : "w-4"
                            }
                            alt="Delete notification"
                            src={notification.deleteIcon}
                          />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination loading indicator */}
          {isLoading && notificationList.length > 0 && (
            <div className="flex justify-center items-center py-8">
              <div className="text-lg text-gray-600">Loading more notifications...</div>
            </div>
          )}

          {/* No more content indicator */}
          {!isLoading && !hasMore && notificationList.length > 0 && (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">You've reached the end! No more notifications to load.</div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="system" className="mt-5">
          {isLoading ? (
            renderLoadingState()
          ) : notificationList.filter(n => n.type === "system").length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-5">
              <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">No system notifications</h3>
              <p className="text-gray-500 text-center max-w-sm leading-relaxed">
                All system updates and alerts will appear here when available.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5 pb-[30px]">
              {notificationList
                .filter((notification) => notification.type === "system")
                .map((notification, index) => {
                  const isRead = notification.isRead;
                  return (
                    <Card
                      key={notification.id}
                      className={`p-0 border-0 rounded-lg border-b border-white translate-y-[-1rem] animate-fade-in opacity-0 transition-all duration-200 cursor-pointer ${
                        isRead
                          ? "bg-white shadow-none"
                          : "shadow-[1px_1px_10px_#c5c5c5] bg-[linear-gradient(0deg,rgba(224,224,224,0.25)_0%,rgba(224,224,224,0.25)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]"
                      }`}
                      style={
                        {
                          "--animation-delay": `${400 + index * 100}ms`,
                        } as React.CSSProperties
                      }
                      onClick={() => handleNotificationClick(notification)}
                    >
                    <CardContent className="flex items-start gap-[30px] p-5">
                      <img
                        className="flex-shrink-0"
                        alt="System notification icon"
                        src={notification.icon}
                      />

                      <div className="flex items-start gap-5 flex-1">
                        <div className="flex flex-col gap-2.5 flex-1">
                          <div className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-base leading-[23px]">
                            {notification.category}
                          </div>
                          <div className="[font-family:'Lato',Helvetica] font-medium text-off-black text-lg leading-[23px]">
                            {notification.message}
                          </div>
                        </div>

                        <div className="flex flex-col items-end justify-center gap-[5px] flex-shrink-0">
                          <div className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-sm leading-[23px]">
                            {notification.timestamp}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-auto hover:bg-transparent"
                            onClick={(e) => handleDeleteNotification(notification.id, e)}
                          >
                            <img
                              className="h-[35px]"
                              alt="Delete notification"
                              src={notification.deleteIcon}
                            />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="treasury" className="mt-5">
          <div className="flex flex-col items-center justify-center py-20 px-5">
            <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No treasury notifications</h3>
            <p className="text-gray-500 text-center max-w-sm leading-relaxed">
              Your treasury updates will appear here.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
};