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
  { value: "treasury", label: "Treasury" },
  { value: "comment", label: "Comment" },
  { value: "earning", label: "Earning" },
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
    articleId: n.metadata?.articleUuid || n.metadata?.articleId, // Prefer UUID as work routes use UUID
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
        defaultValue="treasury"
        className="w-full translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]"
      >
        <TabsList className="flex w-full bg-transparent h-auto p-0 gap-0 border-b border-gray-100">
          {notificationTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="group flex-1 justify-center px-6 py-4 bg-transparent rounded-none border-0 transition-all duration-200 relative hover:bg-gray-50/50 data-[state=active]:bg-transparent data-[state=active]:shadow-none [font-family:'Lato',Helvetica] font-medium text-gray-600 text-base leading-tight data-[state=active]:text-black data-[state=active]:font-bold"
            >
              <span className="relative z-10">{tab.label}</span>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 group-data-[state=active]:w-12 h-0.5 bg-black transition-all duration-300 ease-out"></div>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="treasury" className="mt-5">
          {isLoading ? (
            renderLoadingState()
          ) : notificationList.filter(n => n.type === "like").length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-5">
              <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center">
                <svg className="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">No treasury notifications</h3>
              <p className="text-gray-500 text-center max-w-sm leading-relaxed">
                Your treasury updates will appear here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5 pb-[30px]">
              {notificationList
                .filter((notification) => notification.type === "like")
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
                      <div
                        className={`relative ${(notification.namespace || notification.userId) ? 'cursor-pointer hover:opacity-80 transition-opacity duration-200' : ''}`}
                        onClick={(notification.namespace || notification.userId) ? (e) => handleUserClick(notification, e) : undefined}
                      >
                        <Avatar className="w-[45px] h-[45px] flex-shrink-0">
                          <AvatarImage
                            src={notification.profileImage}
                            alt="Profile"
                            className="object-cover"
                          />
                          <AvatarFallback>UN</AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="flex items-start gap-5 flex-1">
                        <div className="flex flex-col gap-2.5 flex-1">
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
                              className="w-4"
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

        <TabsContent value="comment" className="mt-5">
          {isLoading ? (
            renderLoadingState()
          ) : notificationList.filter(n => n.type === "comment").length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-5">
              <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">No comment notifications</h3>
              <p className="text-gray-500 text-center max-w-sm leading-relaxed">
                Your comment updates will appear here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5 pb-[30px]">
              {notificationList
                .filter((notification) => notification.type === "comment")
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
                      <div
                        className={`relative ${(notification.namespace || notification.userId) ? 'cursor-pointer hover:opacity-80 transition-opacity duration-200' : ''}`}
                        onClick={(notification.namespace || notification.userId) ? (e) => handleUserClick(notification, e) : undefined}
                      >
                        <Avatar className="w-[45px] h-[45px] flex-shrink-0">
                          <AvatarImage
                            src={notification.profileImage}
                            alt="Profile"
                            className="object-cover"
                          />
                          <AvatarFallback>UN</AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="flex items-start gap-5 flex-1">
                        <div className="flex flex-col gap-2.5 flex-1">
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
                              className="w-4"
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

        <TabsContent value="earning" className="mt-5">
          <div className="flex flex-col items-center justify-center py-20 px-5">
            <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No earning notifications</h3>
            <p className="text-gray-500 text-center max-w-sm leading-relaxed">
              Your earning updates will appear here.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
};