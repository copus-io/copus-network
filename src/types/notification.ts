export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'system';
  title: string;
  message: string;
  avatar?: string;
  timestamp: number;
  isRead: boolean;
  actionUrl?: string;
  metadata?: {
    articleId?: string;
    userId?: string;
    commentId?: string;
  };
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: (page?: number, pageSize?: number, msgType?: number) => Promise<void>;
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