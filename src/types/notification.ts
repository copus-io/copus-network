export interface Notification {
  id: string;
  type: 'comment' | 'follow' | 'system' | 'treasury' | 'mention' | 'follow_treasury' | 'comment_reply' | 'comment_like' | 'unlock';
  title: string;
  message: string;
  avatar?: string;
  timestamp: number;
  isRead: boolean;
  actionUrl?: string;
  metadata?: {
    senderId?: string;
    senderUsername?: string;
    senderNamespace?: string;
    targetId?: string;
    targetUuid?: string;
    targetType?: 'article' | 'treasury' | 'comment' | 'user';
    targetTitle?: string;
    actionType?: string;
    extra?: Record<string, any>;
    // Legacy fields for backward compatibility
    articleId?: string;
    userId?: string;
    commentId?: string;
    articleUuid?: string;
  };
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  currentPage: number;
  fetchNotifications: (page?: number, pageSize?: number, filters?: any, append?: boolean) => Promise<void>;
  loadMoreNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
}

export interface NotificationApiResponse {
  status: number;
  msg: string;
  data: {
    notifications: Array<{
      id: string;
      type: string;
      title: string;
      message: string;
      avatar?: string;
      timestamp: number;
      isRead: boolean;
      actionUrl?: string;
      metadata?: any;
    }>;
    totalCount: number;
    unreadCount: number;
  };
}