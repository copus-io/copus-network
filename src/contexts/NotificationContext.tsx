import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Notification, NotificationContextType } from '../types/notification';
import { notificationService } from '../services/notificationService';
import { AuthService } from '../services/authService';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
}

type NotificationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'SET_UNREAD_COUNT'; payload: number }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'DELETE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL' };

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
};

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.isRead).length,
        isLoading: false,
      };

    case 'SET_UNREAD_COUNT':
      return {
        ...state,
        unreadCount: action.payload,
      };

    case 'ADD_NOTIFICATION':
      const newNotifications = [action.payload, ...state.notifications];
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: newNotifications.filter(n => !n.isRead).length,
      };

    case 'MARK_AS_READ':
      const updatedNotifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, isRead: true } : n
      );
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.isRead).length,
      };

    case 'MARK_ALL_AS_READ':
      const allReadNotifications = state.notifications.map(n => ({ ...n, isRead: true }));
      return {
        ...state,
        notifications: allReadNotifications,
        unreadCount: 0,
      };

    case 'DELETE_NOTIFICATION':
      const filteredNotifications = state.notifications.filter(n => n.id !== action.payload);
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: filteredNotifications.filter(n => !n.isRead).length,
      };

    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      };

    default:
      return state;
  }
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const fetchNotifications = async (
    page: number = 1,
    pageSize: number = 20,
    msgType: number = 0 // 默认获取所有类型的消息
  ): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const notifications = await notificationService.getNotifications(page, pageSize, msgType);
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
    } catch (error) {
      console.error('❌ Failed to fetch notifications:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchUnreadCount = async (): Promise<void> => {
    try {
      // Check if there is a valid authentication token
      const token = localStorage.getItem('copus_token');
      if (!token || token.trim() === '') {
        // When no token exists, set unread count to 0 without error
        dispatch({ type: 'SET_UNREAD_COUNT', payload: 0 });
        return;
      }

      const unreadCount = await AuthService.getUnreadMessageCount();
      dispatch({ type: 'SET_UNREAD_COUNT', payload: unreadCount });
    } catch (error) {
      // If authentication error, handle silently and set unread count to 0
      if (error instanceof Error && error.message.includes('Valid authentication token not found')) {
        dispatch({ type: 'SET_UNREAD_COUNT', payload: 0 });
      } else {
        console.error('❌ Failed to fetch unread message count:', error);
      }
    }
  };

  const markAsRead = async (notificationId: string): Promise<void> => {
    try {
      // 记录用户操作时间，避免轮询冲突
      localStorage.setItem('lastNotificationAction', Date.now().toString());

      const success = await notificationService.markAsRead(notificationId);

      if (success) {
        dispatch({ type: 'MARK_AS_READ', payload: notificationId });
        // 重新获取未读数量
        await fetchUnreadCount();
      } else {
        console.error('❌ API标记失败');
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async (): Promise<void> => {
    try {
      await notificationService.markAllAsRead();
      dispatch({ type: 'MARK_ALL_AS_READ' });
      // 重新获取未读数量
      await fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string): Promise<void> => {
    try {
      const success = await notificationService.deleteNotification(notificationId);

      if (success) {
        dispatch({ type: 'DELETE_NOTIFICATION', payload: notificationId });
        // 重新获取未读数量
        await fetchUnreadCount();
      } else {
        console.error('❌ 删除消息失败');
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const clearAllNotifications = async (): Promise<void> => {
    try {
      await notificationService.clearAll();
      dispatch({ type: 'CLEAR_ALL' });
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
    }
  };

  // 初始化时优先获取未读消息数量（更高效）
  useEffect(() => {
    fetchUnreadCount();
    // 移除自动获取通知列表 - 改为用户点击时按需加载
  }, []);

  // 定期轮询未读消息数量（每30秒）- 只检查数量不获取列表
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount();
      // 移除自动获取通知列表 - 改为用户点击时按需加载
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const contextValue: NotificationContextType = {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    isLoading: state.isLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};