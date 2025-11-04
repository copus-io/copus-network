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
    hasMore,
    fetchNotifications,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotification();

  // 页面加载时获取通知列表 - 添加延迟避免资源冲突
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotifications();
    }, 500);

    return () => clearTimeout(timer);
  }, []); // 移除fetchNotifications依赖，只在组件首次加载时执行

  // 无限滚动效果
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrolledToBottom = scrollTop + windowHeight >= documentHeight - 1000; // 提前1000px触发

      if (scrolledToBottom && hasMore && !isLoading) {
        loadMoreNotifications();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasMore, isLoading, loadMoreNotifications]);

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

  // 使用Context的真实通知数据，使用稳定的时间格式化
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
    userId: n.metadata?.senderId, // 使用senderId
    namespace: n.metadata?.senderNamespace, // 添加namespace用于导航
    articleId: n.metadata?.articleUuid || n.metadata?.articleId, // 优先使用UUID，因为work路由使用UUID
  }));

  // 渲染空状态组件
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

  // 渲染加载状态
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

  // 处理用户点击跳转到个人资料页
  const handleUserClick = (notification: any, e: React.MouseEvent) => {
    e.stopPropagation(); // 防止触发通知卡片的点击事件

    // 优先使用namespace，其次使用userId
    if (notification.namespace) {
      // 使用短链接格式跳转到用户资料页
      navigate(`/u/${notification.namespace}`);
    } else if (notification.userId) {
      // 兜底方案：使用userId
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
                            src={notification.profileImage}
                            alt="Profile"
                            className="object-cover"
                          />
                          <AvatarFallback>UN</AvatarFallback>
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
                          {notification.type !== "system" ? (
                            // 为非系统通知解析用户名和文章标题
                            (() => {
                              const message = notification.message;
                              // 提取用户名：通常在消息开头
                              const userNameMatch = message.match(/^([^<>\s]+(?:\s+[^<>\s]+)*?)\s+(liked|commented|treasured)/);
                              // 提取文章标题：通常在引号中
                              const postTitleMatch = message.match(/"([^"]+)"/);

                              if (userNameMatch || postTitleMatch) {
                                let parts = [];
                                let remainingMessage = message;

                                // 处理用户名部分
                                if (userNameMatch && (notification.namespace || notification.userId)) {
                                  const userName = userNameMatch[1];
                                  const beforeUser = remainingMessage.substring(0, userNameMatch.index);
                                  parts.push(beforeUser);
                                  parts.push(
                                    <span
                                      key="username"
                                      className="cursor-pointer hover:text-blue-600 hover:underline transition-colors duration-200 font-semibold"
                                      onClick={(e) => handleUserClick(notification, e)}
                                      title="Click to view user profile"
                                    >
                                      {userName}
                                    </span>
                                  );
                                  remainingMessage = remainingMessage.substring(userNameMatch.index + userName.length);
                                }

                                // 处理文章标题部分
                                if (postTitleMatch) {
                                  const fullMatch = postTitleMatch[0]; // 包含引号的完整匹配
                                  const postTitle = postTitleMatch[1]; // 不含引号的标题
                                  const matchIndex = remainingMessage.indexOf(fullMatch);

                                  if (matchIndex !== -1) {
                                    // 添加标题前的文本
                                    parts.push(remainingMessage.substring(0, matchIndex));
                                    parts.push('"');

                                    // 添加可点击的标题
                                    if (notification.articleId) {
                                      parts.push(
                                        <span
                                          key="posttitle"
                                          className="cursor-pointer hover:text-blue-600 hover:underline transition-colors duration-200 font-bold"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/work/${notification.articleId}`);
                                          }}
                                          title="Click to view content"
                                        >
                                          {postTitle}
                                        </span>
                                      );
                                    } else {
                                      parts.push(<span key="posttitle" className="font-bold">{postTitle}</span>);
                                    }

                                    parts.push('"');
                                    remainingMessage = remainingMessage.substring(matchIndex + fullMatch.length);
                                  }
                                }

                                // 添加剩余的消息
                                parts.push(remainingMessage);

                                return <span>{parts}</span>;
                              }
                              return message;
                            })()
                          ) : (
                            notification.message
                          )}
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

          {/* 分页加载指示器 */}
          {isLoading && notificationList.length > 0 && (
            <div className="flex justify-center items-center py-8">
              <div className="text-lg text-gray-600">正在加载更多通知...</div>
            </div>
          )}

          {/* 没有更多内容提示 */}
          {!isLoading && !hasMore && notificationList.length > 0 && (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">已经到底了！没有更多通知可加载。</div>
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