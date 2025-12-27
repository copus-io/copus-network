import React, { useEffect, useState } from "react";
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
import { ReplyModal } from "../../../../components/CommentSection/ReplyModal";
import { Comment } from "../../../../types/comment";

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

  // 回复弹窗状态管理
  const [replyModalState, setReplyModalState] = useState<{
    isOpen: boolean;
    targetComment: Comment | null;
    targetType: 'article' | 'treasury' | 'user' | 'space';
    targetId: string;
    articleId?: string;
  }>({
    isOpen: false,
    targetComment: null,
    targetType: 'article',
    targetId: '',
    articleId: undefined
  });

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

  // Render notification message with bold username
  const renderMessage = (message: string) => {
    // Common action words that separate username from the rest of the message
    const actionWords = [' treasured ', ' commented ', ' liked ', ' replied ', ' mentioned ', ' followed '];

    for (const action of actionWords) {
      const index = message.toLowerCase().indexOf(action.toLowerCase());
      if (index > 0) {
        const username = message.substring(0, index);
        const rest = message.substring(index);
        return (
          <>
            <span className="font-semibold">{username}</span>
            <span className="font-normal">{rest}</span>
          </>
        );
      }
    }

    // If no action word found, return message as is
    return message;
  };

  // Use real notification data from Context with stable time formatting
  const notificationList = contextNotifications.map(n => ({
    id: parseInt(n.id) || 1,
    type: n.type,
    category: n.type === "system" ? "System" :
              n.type === "follow" || n.type === "follow_treasury" ? "Treasury" :
              n.type === "comment" || n.type === "comment_reply" || n.type === "comment_like" || n.type === "treasury" ? "Comment" :
              n.type === "unlock" ? "Earning" : "Notification",
    message: n.message || n.title,
    timestamp: formatTimestamp(n.timestamp),
    isRead: n.isRead,
    icon: n.type === "system" ? "https://c.animaapp.com/mft4oqz6uyUKY7/img/icon-wrap-1.svg" : undefined,
    profileImage: n.avatar,
    deleteIcon: n.type === "system" ? "https://c.animaapp.com/mft4oqz6uyUKY7/img/delete.svg" : "https://c.animaapp.com/mft4oqz6uyUKY7/img/delete-1.svg",
    // 对于类型8，优先从 senderInfo 获取用户数据
    userId: n.metadata?.senderInfo?.id || n.metadata?.senderId,
    namespace: n.metadata?.senderInfo?.namespace || n.metadata?.senderNamespace,
    articleId: n.metadata?.targetUuid || n.metadata?.targetId || n.metadata?.articleUuid || n.metadata?.articleId, // Prefer targetUuid for new format
    metadata: n.metadata, // 传递完整的 metadata 对象！
  }));

  // Render notification avatar based on type and senderInfo data
  const renderNotificationAvatar = (notification: any) => {
    // 类型3：空间相关消息优先显示coverurl，否则显示空间图标
    if (notification.type === 3 || notification.type === 'follow_treasury') {
      // 如果metadata是字符串，先解析
      let metadataObj = notification.metadata;
      if (typeof notification.metadata === 'string') {
        try {
          metadataObj = JSON.parse(notification.metadata);
        } catch (e) {
          console.error('Failed to parse metadata JSON:', e);
          metadataObj = {};
        }
      }

      // spaceInfo 数据在 extra 中（因为 NotificationMessageFactory 将 parsedData 放在 extra 中）
      const coverUrl = metadataObj?.extra?.spaceInfo?.coverUrl;

      if (coverUrl) {
        // 如果有coverurl，显示图片头像
        return (
          <>
            <AvatarImage
              src={coverUrl}
              alt="Space cover"
              className="object-cover"
            />
            <AvatarFallback>
              <div className="w-full h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center">
                <svg
                  className="w-4 h-4 sm:w-6 sm:h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"/>
                </svg>
              </div>
            </AvatarFallback>
          </>
        );
      } else {
        // 没有coverurl时，检查是否有空间名称，有的话显示首字母，否则显示空间图标
        const spaceName = metadataObj?.extra?.spaceInfo?.name;
        if (spaceName) {
          const firstLetter = spaceName.charAt(0).toUpperCase();
          return (
            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs sm:text-lg font-medium text-gray-600">
                {firstLetter}
              </span>
            </div>
          );
        } else {
          // 完全没有空间信息时显示空间图标
          return (
            <div className="w-full h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center">
              <svg
                className="w-4 h-4 sm:w-6 sm:h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"/>
              </svg>
            </div>
          );
        }
      }
    }
    // 类型8：根据senderInfo判断显示系统图标还是用户头像
    else if (notification.type === 8 || notification.type === 'system') {
      // 检查是否有senderInfo数据，如果有则显示用户头像
      if (notification.metadata?.senderInfo || notification.metadata?.senderId) {
        const avatarUrl = notification.metadata?.senderInfo?.faceUrl || notification.profileImage;
        return (
          <>
            <AvatarImage
              src={avatarUrl || "data:image/svg+xml,%3csvg%20width='100'%20height='100'%20viewBox='0%200%20100%20100'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20width='100'%20height='100'%20rx='50'%20fill='white'/%3e%3crect%20width='100'%20height='100'%20rx='50'%20fill='%23E0E0E0'%20fill-opacity='0.4'/%3e%3cpath%20d='M73.9643%2060.6618V60.9375C73.9643%2074.2269%2063.2351%2085%2050%2085C36.7649%2085%2026.0357%2074.2269%2026.0357%2060.9375V60.6618C22.2772%2059.6905%2019.5%2056.2646%2019.5%2052.1875C19.5%2048.1104%2022.2772%2044.6845%2026.0357%2043.7132V39.0625C26.0357%2025.7731%2036.7649%2015%2050%2015C63.2351%2015%2073.9643%2025.7731%2073.9643%2039.0625V43.7132C77.7228%2044.6845%2080.5%2048.1104%2080.5%2052.1875C80.5%2056.2646%2077.7228%2059.6905%2073.9643%2060.6618ZM69.6071%2043.4375H67.2192C62.2208%2043.4375%2057.8638%2040.0217%2056.6515%2035.1527L56.5357%2034.6875L48.85%2038.5461C43.0934%2041.4362%2036.8058%2043.0815%2030.3929%2043.3858V60.9375C30.3929%2071.8106%2039.1713%2080.625%2050%2080.625C60.8287%2080.625%2069.6071%2071.8106%2069.6071%2060.9375V43.4375ZM39.1071%2050C39.1071%2048.7919%2040.0825%2047.8125%2041.2857%2047.8125C42.4889%2047.8125%2043.4643%2048.7919%2043.4643%2050V54.375C43.4643%2055.5831%2042.4889%2056.5625%2041.2857%2056.5625C40.0825%2056.5625%2039.1071%2055.5831%2039.1071%2054.375V50ZM56.5357%2050C56.5357%2048.7919%2057.5111%2047.8125%2058.7143%2047.8125C59.9175%2047.8125%2060.8929%2048.7919%2060.8929%2050V54.375C60.8929%2055.5831%2059.9175%2056.5625%2058.7143%2056.5625C57.5111%2056.5625%2056.5357%2055.5831%2056.5357%2054.375V50ZM41.9964%2071.3039C41.1073%2070.4899%2041.0438%2069.1064%2041.8544%2068.2136C42.6651%2067.3209%2044.0431%2067.2571%2044.9321%2068.0711C46.0649%2069.1081%2047.4581%2069.6875%2048.8886%2069.6875C50.3722%2069.6875%2051.7728%2069.1187%2052.8779%2068.0924C53.7612%2067.2721%2055.1396%2067.3261%2055.9565%2068.2131C56.7735%2069.1%2056.7197%2070.484%2055.8364%2071.3043C53.9384%2073.0668%2051.4869%2074.0625%2048.8886%2074.0625C46.3342%2074.0625%2043.907%2073.0532%2041.9964%2071.3039ZM23.8571%2052.1875C23.8571%2053.8069%2024.7334%2055.2207%2026.0357%2055.9772V48.3978C24.7334%2049.1543%2023.8571%2050.5681%2023.8571%2052.1875ZM76.1429%2052.1875C76.1429%2050.5681%2075.2666%2049.1543%2073.9643%2048.3978V55.9772C75.2666%2055.2207%2076.1429%2053.8069%2076.1429%2052.1875Z'%20fill='black'/%3e%3c/svg%3e"}
              alt="Profile"
              className="object-cover"
            />
            <AvatarFallback>AN</AvatarFallback>
          </>
        );
      } else {
        // 没有senderInfo时显示系统图标
        return (
          <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
            <svg
              className="w-4 h-4 sm:w-6 sm:h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        );
      }
    }
    else {
      // 所有其他类型的消息都显示用户头像
      return (
        <>
          <AvatarImage
            src={notification.profileImage || "data:image/svg+xml,%3csvg%20width='100'%20height='100'%20viewBox='0%200%20100%20100'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20width='100'%20height='100'%20rx='50'%20fill='white'/%3e%3crect%20width='100'%20height='100'%20rx='50'%20fill='%23E0E0E0'%20fill-opacity='0.4'/%3e%3cpath%20d='M73.9643%2060.6618V60.9375C73.9643%2074.2269%2063.2351%2085%2050%2085C36.7649%2085%2026.0357%2074.2269%2026.0357%2060.9375V60.6618C22.2772%2059.6905%2019.5%2056.2646%2019.5%2052.1875C19.5%2048.1104%2022.2772%2044.6845%2026.0357%2043.7132V39.0625C26.0357%2025.7731%2036.7649%2015%2050%2015C63.2351%2015%2073.9643%2025.7731%2073.9643%2039.0625V43.7132C77.7228%2044.6845%2080.5%2048.1104%2080.5%2052.1875C80.5%2056.2646%2077.7228%2059.6905%2073.9643%2060.6618ZM69.6071%2043.4375H67.2192C62.2208%2043.4375%2057.8638%2040.0217%2056.6515%2035.1527L56.5357%2034.6875L48.85%2038.5461C43.0934%2041.4362%2036.8058%2043.0815%2030.3929%2043.3858V60.9375C30.3929%2071.8106%2039.1713%2080.625%2050%2080.625C60.8287%2080.625%2069.6071%2071.8106%2069.6071%2060.9375V43.4375ZM39.1071%2050C39.1071%2048.7919%2040.0825%2047.8125%2041.2857%2047.8125C42.4889%2047.8125%2043.4643%2048.7919%2043.4643%2050V54.375C43.4643%2055.5831%2042.4889%2056.5625%2041.2857%2056.5625C40.0825%2056.5625%2039.1071%2055.5831%2039.1071%2054.375V50ZM56.5357%2050C56.5357%2048.7919%2057.5111%2047.8125%2058.7143%2047.8125C59.9175%2047.8125%2060.8929%2048.7919%2060.8929%2050V54.375C60.8929%2055.5831%2059.9175%2056.5625%2058.7143%2056.5625C57.5111%2056.5625%2056.5357%2055.5831%2056.5357%2054.375V50ZM41.9964%2071.3039C41.1073%2070.4899%2041.0438%2069.1064%2041.8544%2068.2136C42.6651%2067.3209%2044.0431%2067.2571%2044.9321%2068.0711C46.0649%2069.1081%2047.4581%2069.6875%2048.8886%2069.6875C50.3722%2069.6875%2051.7728%2069.1187%2052.8779%2068.0924C53.7612%2067.2721%2055.1396%2067.3261%2055.9565%2068.2131C56.7735%2069.1%2056.7197%2070.484%2055.8364%2071.3043C53.9384%2073.0668%2051.4869%2074.0625%2048.8886%2074.0625C46.3342%2074.0625%2043.907%2073.0532%2041.9964%2071.3039ZM23.8571%2052.1875C23.8571%2053.8069%2024.7334%2055.2207%2026.0357%2055.9772V48.3978C24.7334%2049.1543%2023.8571%2050.5681%2023.8571%2052.1875ZM76.1429%2052.1875C76.1429%2050.5681%2075.2666%2049.1543%2073.9643%2048.3978V55.9772C75.2666%2055.2207%2076.1429%2053.8069%2076.1429%2052.1875Z'%20fill='black'/%3e%3c/svg%3e"}
            alt="Profile"
            className="object-cover"
          />
          <AvatarFallback>AN</AvatarFallback>
        </>
      );
    }
  };

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

  // 处理回复按钮点击
  const handleReplyClick = (notification: any, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡

    // 从通知数据中构建评论对象
    const targetComment: Comment = {
      id: notification.metadata?.commentId || notification.metadata?.extra?.commentId || notification.id.toString(),
      uuid: notification.metadata?.commentId || notification.metadata?.extra?.commentId || notification.id.toString(),
      content: notification.metadata?.extra?.commentContent || notification.metadata?.commentContent || '评论内容',
      contentType: 'text',
      targetType: 'article', // 默认为文章
      targetId: notification.articleId || notification.metadata?.targetId || notification.metadata?.targetUuid || '',
      authorId: Number(notification.userId || notification.metadata?.senderId || 0),
      authorName: notification.metadata?.senderUsername || 'Unknown User',
      authorNamespace: notification.metadata?.senderNamespace,
      authorAvatar: notification.profileImage,
      depth: 0,
      likesCount: 0,
      repliesCount: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEdited: false,
      isDeleted: false,
      canEdit: false,
      canDelete: false,
      images: []
    };

    setReplyModalState({
      isOpen: true,
      targetComment,
      targetType: 'article',
      targetId: notification.articleId || notification.metadata?.targetId || notification.metadata?.targetUuid || '',
      articleId: notification.articleId || notification.metadata?.targetId || notification.metadata?.targetUuid
    });
  };

  // 关闭回复弹窗
  const handleCloseReplyModal = () => {
    setReplyModalState({
      isOpen: false,
      targetComment: null,
      targetType: 'article',
      targetId: '',
      articleId: undefined
    });
  };

  // 回复完成处理
  const handleReplyComplete = () => {
    handleCloseReplyModal();
    // 可以在这里添加刷新通知列表的逻辑
    console.log('Reply completed');
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

  // Handle avatar click for follow_treasury - should go to the treasury page
  const handleFollowTreasuryAvatarClick = (notification: any, e: React.MouseEvent) => {
    e.stopPropagation();

    const spaceNamespace = notification.metadata?.extra?.spaceNamespace;
    const spaceId = notification.metadata?.extra?.spaceId;
    const articleUuid = notification.metadata?.extra?.articleUuid;
    const articleId = notification.metadata?.extra?.articleId;

    console.log('[Follow Treasury Avatar Click]', { spaceNamespace, spaceId, articleUuid, articleId });

    if (spaceNamespace) {
      navigate(`/treasury/${spaceNamespace}`);
    } else if (articleUuid || articleId) {
      // Fallback to article page
      navigate(`/work/${articleUuid || articleId}`);
    }
  };

  // Parse message with clickable elements in square brackets
  const parseMessageWithLinks = (message: string, notification: any) => {
    // Split message by square brackets pattern: [content]
    const parts = message.split(/(\[[^\]]+\])/g);
    const bracketedParts = parts.filter(p => p.startsWith('[') && p.endsWith(']'));

    return parts.map((part, index) => {
      // Check if this part is in square brackets
      if (part.startsWith('[') && part.endsWith(']')) {
        const linkText = part.slice(1, -1); // Remove brackets
        const bracketIndex = bracketedParts.indexOf(part);

        // Check bracket position
        const isFirstBracket = bracketIndex === 0;

        // Check if this is content title (second bracket, typically the work/article title)
        const isContentTitle = bracketIndex === 1;

        // Check if this is comment content (third bracket or later)
        const isCommentContent = bracketIndex >= 2;

        // IMPORTANT: Check notification type FIRST before generic isUsername check
        // Different notification types have different bracket meanings

        // Handle follow_treasury: [Space Name] you follow has listed a new treasure [Article Title]
        if (notification.type === 'follow_treasury') {
          const isSpaceName = isFirstBracket;  // First bracket is space name
          const isArticleTitle = !isFirstBracket;

          return (
            <span
              key={index}
              className="font-semibold cursor-pointer hover:opacity-70 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();

                console.log('[Follow Treasury Click Debug]', {
                  isSpaceName,
                  isArticleTitle,
                  linkText,
                  metadata: notification.metadata,
                  extra: notification.metadata?.extra,
                  spaceNamespace: notification.metadata?.extra?.spaceNamespace,
                  spaceId: notification.metadata?.extra?.spaceId,
                  allExtraKeys: notification.metadata?.extra ? Object.keys(notification.metadata.extra) : 'no extra'
                });

                if (isArticleTitle) {
                  const articleId = notification.metadata?.extra?.articleUuid ||
                                  notification.metadata?.extra?.articleId ||
                                  notification.articleId;
                  console.log('[Follow Treasury Click] Navigating to article:', articleId);
                  if (articleId) {
                    navigate(`/work/${articleId}`);
                  }
                } else {
                  // First bracket is space name - navigate to the space
                  const spaceNamespace = notification.metadata?.extra?.spaceNamespace;
                  const spaceId = notification.metadata?.extra?.spaceId;
                  // Try to get article info for fallback navigation
                  const articleUuid = notification.metadata?.extra?.articleUuid;
                  const articleId = notification.metadata?.extra?.articleId;
                  console.log('[Follow Treasury Click] Space info:', { spaceNamespace, spaceId, articleUuid, articleId });

                  if (spaceNamespace) {
                    navigate(`/treasury/${spaceNamespace}`);
                  } else if (articleUuid || articleId) {
                    // Fallback: if no space namespace, navigate to the article which shows the space
                    console.log('[Follow Treasury Click] No namespace, navigating to article instead');
                    navigate(`/work/${articleUuid || articleId}`);
                  } else {
                    console.warn('[Follow Treasury Click] No space namespace or article found! Extra:', notification.metadata?.extra);
                  }
                }
              }}
              title={isArticleTitle ? "Click to view article" : "Click to view space"}
            >
              {linkText}
            </span>
          );
        }

        // Handle follow: [Username] followed your space [Space Name]
        if (notification.type === 'follow') {
          const isSpaceName = !isFirstBracket;

          return (
            <span
              key={index}
              className="font-semibold cursor-pointer hover:opacity-70 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();

                console.log('[Follow Click Debug] Full notification object:', notification);
                console.log('[Follow Click Debug] Details:', {
                  isSpaceName,
                  linkText,
                  notificationType: notification.type,
                  metadata: notification.metadata,
                  extra: notification.metadata?.extra,
                  extraSpaceInfo: notification.metadata?.extra?.spaceInfo,
                  spaceNamespace: notification.metadata?.extra?.spaceNamespace,
                  namespace: notification.metadata?.extra?.namespace,
                  senderNamespace: notification.metadata?.senderNamespace,
                  // Check if namespace exists at root level of extra
                  allExtraKeys: notification.metadata?.extra ? Object.keys(notification.metadata.extra) : 'no extra'
                });

                if (isSpaceName) {
                  // For "follow" notifications, the space that was followed is YOUR space
                  // The spaceNamespace should come from the notification content
                  // Try multiple possible locations for the space namespace
                  const spaceNamespace = notification.metadata?.extra?.spaceNamespace ||
                                        notification.metadata?.extra?.spaceInfo?.namespace ||
                                        notification.metadata?.extra?.namespace;
                  console.log('[Follow Click] Using space namespace:', spaceNamespace);
                  if (spaceNamespace) {
                    navigate(`/treasury/${spaceNamespace}`);
                  } else {
                    console.warn('[Follow Click] No space namespace found in metadata. Checking alternative locations...');
                    console.log('[Follow Click] Full extra object:', JSON.stringify(notification.metadata?.extra, null, 2));
                  }
                } else {
                  const senderNamespace = notification.metadata?.senderNamespace ||
                                         notification.namespace;
                  if (senderNamespace) {
                    navigate(`/u/${senderNamespace}`);
                  }
                }
              }}
              title={isSpaceName ? "Click to view space" : "Click to view user profile"}
            >
              {linkText}
            </span>
          );
        }

        // Handle treasury and comment notifications
        if (notification.type === 'treasury' || notification.type === 'comment') {
          if (isCommentContent) {
            // Comment content - light weight, with quotes, no background, colon before
            return (
              <span
                key={index}
                className="font-light text-gray-600"
              >
                : "{linkText}"
              </span>
            );
          } else if (isContentTitle) {
            // Content title - bold, no underline, clickable
            return (
              <span
                key={index}
                className="font-semibold cursor-pointer hover:opacity-70 transition-opacity"
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
          } else {
            // Username - bold, no underline
            return (
              <span
                key={index}
                className="font-semibold cursor-pointer hover:opacity-70 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  const namespace = notification.namespace || notification.metadata?.senderNamespace;
                  if (namespace) {
                    navigate(`/u/${namespace}`);
                  }
                }}
                title="Click to view user profile"
              >
                {linkText}
              </span>
            );
          }
        } else if (notification.type === 'comment_reply' || notification.type === 'comment_like') {
          if (isCommentContent || (linkText.length > 10 && !isFirstBracket)) {
            // Comment content - light weight, with quotes, no background, colon before
            return (
              <span
                key={index}
                className="font-light text-gray-600 cursor-pointer hover:opacity-70 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  const articleId = notification.articleId || notification.metadata?.targetUuid || notification.metadata?.targetId;
                  const commentId = notification.metadata?.commentId;

                  if (articleId) {
                    if (notification.type === 'comment_reply') {
                      navigate(`/work/${articleId}?openComments=true&commentId=${commentId}#comment-${commentId}`);
                    } else if (notification.type === 'comment_like') {
                      navigate(`/work/${articleId}?openComments=true#comments`);
                    }
                  }
                }}
                title="Click to view comment"
              >
                : "{linkText}"
              </span>
            );
          } else if (isContentTitle) {
            // Content title - bold, no underline
            return (
              <span
                key={index}
                className="font-semibold cursor-pointer hover:opacity-70 transition-opacity"
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
          } else {
            // Username - bold, no underline
            return (
              <span
                key={index}
                className="font-semibold cursor-pointer hover:opacity-70 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  const senderNamespace = notification.metadata?.senderNamespace;
                  if (senderNamespace) {
                    navigate(`/u/${senderNamespace}`);
                  }
                }}
                title="Click to view user profile"
              >
                {linkText}
              </span>
            );
          }
        } else if (notification.type === 'unlock') {
          // For unlock/earning notifications - content title is bold
          return (
            <span
              key={index}
              className="font-semibold cursor-pointer hover:opacity-70 transition-opacity"
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
        } else {
          // Default: bold, no underline
          return (
            <span key={index} className="font-semibold">
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
        defaultValue="treasury"
        className="w-full translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]"
      >
        <TabsList className="flex w-full bg-transparent h-auto p-0 gap-0 border-b border-gray-100">
          {notificationTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="group flex-1 justify-center px-6 py-4 bg-transparent rounded-none border-0 transition-all duration-200 relative hover:bg-gray-50/50 data-[state=active]:bg-transparent data-[state=active]:shadow-none [font-family:'Lato',Helvetica] font-medium text-gray-600 text-base leading-tight data-[state=active]:text-black"
            >
              <span className="relative z-10">{tab.label}</span>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 group-data-[state=active]:w-12 h-0.5 bg-black transition-all duration-300 ease-out"></div>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="treasury" className="mt-5">
          {isLoading ? (
            renderLoadingState()
          ) : notificationList.filter(n => n.type === "follow" || n.type === "follow_treasury").length === 0 ? (
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
                .filter((notification) => notification.type === "follow" || notification.type === "follow_treasury")
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
                    <CardContent className="flex items-start gap-3 sm:gap-[30px] p-3 sm:p-5">
                      <div
                        className="relative cursor-pointer hover:opacity-80 transition-opacity duration-200"
                        onClick={(e) => {
                          // For follow_treasury, navigate to treasury page
                          // For follow, navigate to user profile
                          // For type 8 system messages, navigate to user profile
                          if (notification.type === 'follow_treasury') {
                            handleFollowTreasuryAvatarClick(notification, e);
                          } else {
                            handleUserClick(notification, e);
                          }
                        }}
                        title={notification.type === 'follow_treasury' ? "Click to view treasury" : "Click to view user profile"}
                      >
                        <Avatar className="w-8 h-8 sm:w-[45px] sm:h-[45px] flex-shrink-0">
                          {renderNotificationAvatar(notification)}
                        </Avatar>
                        <div className="absolute inset-0 rounded-full border-2 border-transparent hover:border-blue-300 transition-colors duration-200" />
                      </div>

                      <div className="flex items-start gap-2 sm:gap-5 flex-1 min-w-0">
                        <div className="flex flex-col gap-1 sm:gap-2.5 flex-1 min-w-0">
                          <div className="[font-family:'Lato',Helvetica] font-normal text-off-black text-base leading-tight sm:leading-[23px] break-words">
                            {parseMessageWithLinks(notification.message, notification)}
                          </div>
                        </div>

                        <div className="flex flex-col items-end justify-center gap-1 sm:gap-[5px] flex-shrink-0 min-w-0">
                          <div className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-xs sm:text-sm leading-tight whitespace-nowrap">
                            {notification.timestamp}
                          </div>

                          {/* Delete button */}
                          <div className="flex items-center gap-1 sm:gap-2">
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
          ) : notificationList.filter(n => n.type === "comment" || n.type === "comment_reply" || n.type === "comment_like" || n.type === "treasury").length === 0 ? (
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
                .filter((notification) => notification.type === "comment" || notification.type === "comment_reply" || notification.type === "comment_like" || notification.type === "treasury")
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
                    <CardContent className="flex items-start gap-3 sm:gap-[30px] p-3 sm:p-5">
                      <div
                        className={`relative ${(notification.namespace || notification.userId) ? 'cursor-pointer hover:opacity-80 transition-opacity duration-200' : ''}`}
                        onClick={(notification.namespace || notification.userId) ? (e) => handleUserClick(notification, e) : undefined}
                        title={(notification.namespace || notification.userId) ? "Click to view user profile" : undefined}
                      >
                        <Avatar className="w-8 h-8 sm:w-[45px] sm:h-[45px] flex-shrink-0">
                          {renderNotificationAvatar(notification)}
                        </Avatar>
                        {(notification.namespace || notification.userId) && (
                          <div className="absolute inset-0 rounded-full border-2 border-transparent hover:border-blue-300 transition-colors duration-200" />
                        )}
                      </div>

                      <div className="flex items-start gap-2 sm:gap-5 flex-1 min-w-0">
                        <div className="flex flex-col gap-1 sm:gap-2.5 flex-1 min-w-0">
                          <div className="[font-family:'Lato',Helvetica] font-normal text-off-black text-base leading-tight sm:leading-[23px] break-words">
                            {parseMessageWithLinks(notification.message, notification)}
                          </div>
                        </div>

                        <div className="flex flex-col items-end justify-center gap-1 sm:gap-[5px] flex-shrink-0 min-w-0">
                          <div className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-xs sm:text-sm leading-tight whitespace-nowrap">
                            {notification.timestamp}
                          </div>

                          {/* Reply and delete buttons */}
                          <div className="flex items-center gap-1 sm:gap-2">
                            {/* Reply button - only show for comment-related notifications */}
                            {(notification.type === 'comment' ||
                              notification.type === 'comment_reply' ||
                              notification.message.includes('commented') ||
                              notification.message.includes('replied')) &&
                              !notification.message.includes('liked') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-0.5 sm:p-1 h-auto hover:bg-blue-50 rounded-full transition-all duration-200"
                                onClick={(e) => handleReplyClick(notification, e)}
                                title="Reply to comment"
                              >
                                <svg
                                  className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                  />
                                </svg>
                              </Button>
                            )}

                            {/* Delete button */}
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
                      </div>
                    </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="earning" className="mt-5">
          {isLoading ? (
            renderLoadingState()
          ) : notificationList.filter(n => n.type === "unlock").length === 0 ? (
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
          ) : (
            <div className="flex flex-col gap-5 pb-[30px]">
              {notificationList
                .filter((notification) => notification.type === "unlock")
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
                    <CardContent className="flex items-start gap-3 sm:gap-[30px] p-3 sm:p-5">
                      <div className="w-8 h-8 sm:w-[45px] sm:h-[45px] flex-shrink-0 rounded-full bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>

                      <div className="flex items-start gap-2 sm:gap-5 flex-1 min-w-0">
                        <div className="flex flex-col gap-1 sm:gap-2.5 flex-1 min-w-0">
                          <div className="[font-family:'Lato',Helvetica] font-normal text-off-black text-base leading-tight sm:leading-[23px] break-words">
                            {parseMessageWithLinks(notification.message, notification)}
                          </div>
                        </div>

                        <div className="flex flex-col items-end justify-center gap-1 sm:gap-[5px] flex-shrink-0 min-w-0">
                          <div className="[font-family:'Lato',Helvetica] font-normal text-medium-dark-grey text-xs sm:text-sm leading-tight whitespace-nowrap">
                            {notification.timestamp}
                          </div>

                          {/* Delete button */}
                          <div className="flex items-center gap-1 sm:gap-2">
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
                      </div>
                    </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 回复弹窗 */}
      <ReplyModal
        isOpen={replyModalState.isOpen}
        onClose={handleCloseReplyModal}
        targetComment={replyModalState.targetComment}
        targetType={replyModalState.targetType}
        targetId={replyModalState.targetId}
        articleId={replyModalState.articleId}
        replyState={{
          isReplying: true,
          parentId: replyModalState.targetComment?.id,
          replyToId: replyModalState.targetComment?.id,
          replyToUser: replyModalState.targetComment?.authorName
        }}
        onReplyComplete={handleReplyComplete}
      />
    </section>
  );
};