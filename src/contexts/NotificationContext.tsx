import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Notification, NotificationContextType } from '../types/notification';
import { notificationService } from '../services/notificationService';
import { AuthService } from '../services/authService';
import * as storage from '../utils/storage';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  currentPage: number;
}

type NotificationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LOADING_MORE'; payload: boolean }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'APPEND_NOTIFICATIONS'; payload: { notifications: Notification[]; hasMore: boolean; page: number } }
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
  isLoadingMore: false,
  hasMore: true,
  currentPage: 0,
};

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_LOADING_MORE':
      return { ...state, isLoadingMore: action.payload };

    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.isRead).length,
        isLoading: false,
        hasMore: action.payload.length === 20, // Assume more if we got a full page
        currentPage: 1,
      };

    case 'APPEND_NOTIFICATIONS':
      // Deduplicate notifications by id
      const existingIds = new Set(state.notifications.map(n => n.id));
      const newNotifications = action.payload.notifications.filter(n => !existingIds.has(n.id));
      const allNotifications = [...state.notifications, ...newNotifications];

      return {
        ...state,
        notifications: allNotifications,
        unreadCount: allNotifications.filter(n => !n.isRead).length,
        isLoading: false,
        hasMore: action.payload.hasMore,
        currentPage: action.payload.page,
      };

    case 'SET_UNREAD_COUNT':
      return {
        ...state,
        unreadCount: action.payload,
      };

    case 'ADD_NOTIFICATION':
      const addedNotifications = [action.payload, ...state.notifications];
      return {
        ...state,
        notifications: addedNotifications,
        unreadCount: addedNotifications.filter(n => !n.isRead).length,
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
        hasMore: true,
        currentPage: 0,
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
    msgType: number = 0, // Default to fetch all types of messages
    append: boolean = false // New parameter to control append vs replace
  ): Promise<void> => {
    try {
      // Only set loading state for initial load, not for pagination to avoid scroll jumping
      if (!append) {
        dispatch({ type: 'SET_LOADING', payload: true });
      }

      const result = await notificationService.getNotifications(page, pageSize, msgType);

      if (append) {
        dispatch({
          type: 'APPEND_NOTIFICATIONS',
          payload: {
            notifications: result.data,
            hasMore: result.hasMore,
            page: result.currentPage
          }
        });
      } else {
        dispatch({ type: 'SET_NOTIFICATIONS', payload: result.data });
      }
    } catch (error) {
      // Special handling for authentication errors (401/403)
      // Let the global event handler take care of logout
      if (error instanceof Error && (error.message.includes('Authentication failed') ||
          error.message.includes('401') ||
          error.message.includes('403'))) {
        // Re-throw authentication errors so global handler can catch them
        throw error;
      } else {
        console.error('❌ Failed to fetch notifications:', error);
      }

      // Only reset loading state if it was set for initial load
      if (!append) {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  };

  const fetchUnreadCount = async (): Promise<void> => {
    // Skip if no token (no point in calling authenticated endpoint)
    // Use storage utility to check both localStorage and sessionStorage
    const token = storage.getItem('copus_token');
    if (!token || token.trim() === '') {
      // When no token exists, set unread count to 0 without error
      dispatch({ type: 'SET_UNREAD_COUNT', payload: 0 });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const unreadCount = await AuthService.getUnreadMessageCount();

      // Check if we recently marked all as read
      const markedAllReadTime = localStorage.getItem('lastMarkedAllReadTime');
      const lastKnownCount = localStorage.getItem('lastUnreadCount');

      if (markedAllReadTime) {
        const timeSinceMarkAllRead = Date.now() - parseInt(markedAllReadTime);

        // Within 2 minutes of marking all as read
        if (timeSinceMarkAllRead < 120000) {
          // If server returns the same stale count we had before marking as read, ignore it
          if (lastKnownCount && unreadCount === parseInt(lastKnownCount) && unreadCount > 0) {
            console.log('⏭️ Ignoring stale server count after mark all as read:', unreadCount);
            return; // Keep local count at 0
          }

          // If server returns 0, great! Clear the marker
          if (unreadCount === 0) {
            localStorage.removeItem('lastMarkedAllReadTime');
            localStorage.removeItem('lastUnreadCount');
          }
        } else {
          // More than 2 minutes passed, clear the marker
          localStorage.removeItem('lastMarkedAllReadTime');
          localStorage.removeItem('lastUnreadCount');
        }
      }

      dispatch({ type: 'SET_UNREAD_COUNT', payload: unreadCount });
    } catch (error) {
      // If authentication error, handle silently and set unread count to 0
      if (error instanceof Error && (error.message.includes('Valid authentication token not found') || 
          error.message.includes('Authentication failed') || 
          error.message.includes('401') || 
          error.message.includes('403'))) {
        // Don't dispatch anything here - let the global event handler take care of logout
        // Just silently handle the error to prevent infinite loops and duplicate toasts
        console.log('Authentication error in fetchUnreadCount, handled by global handler');
      } else {
        console.error('❌ Failed to fetch unread message count:', error);
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const markAsRead = async (notificationId: string): Promise<void> => {
    try {
      // Record user action time to avoid polling conflicts
      localStorage.setItem('lastNotificationAction', Date.now().toString());

      const success = await notificationService.markAsRead(notificationId);

      if (success) {
        dispatch({ type: 'MARK_AS_READ', payload: notificationId });
        // Don't refetch immediately - trust local state and let polling update when server syncs
      } else {
        console.error('API mark as read failed');
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async (): Promise<void> => {
    try {
      // Store current count before marking as read - used to detect stale server responses
      localStorage.setItem('lastUnreadCount', state.unreadCount.toString());
      localStorage.setItem('lastMarkedAllReadTime', Date.now().toString());
      // Record user action time to avoid polling conflicts
      localStorage.setItem('lastNotificationAction', Date.now().toString());

      const success = await notificationService.markAllAsRead();

      if (success) {
        dispatch({ type: 'MARK_ALL_AS_READ' });
        // Don't refetch immediately - the server's cache takes time to update
        // The 30-second polling will pick up the correct count once server syncs
        // This prevents the badge from reappearing with stale cached data
      } else {
        console.error('API mark all as read failed');
        // Remove markers if API failed
        localStorage.removeItem('lastMarkedAllReadTime');
        localStorage.removeItem('lastUnreadCount');
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Remove markers if error occurred
      localStorage.removeItem('lastMarkedAllReadTime');
      localStorage.removeItem('lastUnreadCount');
    }
  };

  const deleteNotification = async (notificationId: string): Promise<void> => {
    try {
      // Record user action time to avoid polling conflicts
      localStorage.setItem('lastNotificationAction', Date.now().toString());

      const success = await notificationService.deleteNotification(notificationId);

      if (success) {
        dispatch({ type: 'DELETE_NOTIFICATION', payload: notificationId });
        // Don't refetch immediately - trust local state and let polling update when server syncs
      } else {
        console.error('Failed to delete message');
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const loadMoreNotifications = async (): Promise<void> => {
    if (state.isLoading || state.isLoadingMore || !state.hasMore) {
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING_MORE', payload: true });
      const nextPage = state.currentPage + 1;
      console.log(`[NotificationContext] Loading more notifications - page ${nextPage}`);
      await fetchNotifications(nextPage, 20, 0, true);
    } finally {
      dispatch({ type: 'SET_LOADING_MORE', payload: false });
    }
  };

  const clearAllNotifications = async (): Promise<void> => {
    try {
      const success = await notificationService.clearAll();

      if (success) {
        dispatch({ type: 'CLEAR_ALL' });
      } else {
        console.error('API clear all notifications failed');
      }
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
    }
  };

  // Fetch unread message count on initialization (more efficient)
  useEffect(() => {
    fetchUnreadCount();
    // Removed automatic notification list fetching - changed to on-demand loading when user clicks
  }, []);

  // Periodically poll unread message count (every 60 seconds) - only check count, don't fetch list
  // Optimization: Pause polling when tab is not visible
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const startPolling = () => {
      interval = setInterval(() => {
        // Only poll if document is visible
        if (!document.hidden) {
          fetchUnreadCount();
        }
      }, 60000); // Changed from 30 seconds to 60 seconds
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab hidden - clear interval to save resources
        if (interval) {
          clearInterval(interval);
        }
      } else {
        // Tab visible - fetch immediately and restart polling
        fetchUnreadCount();
        if (interval) {
          clearInterval(interval);
        }
        startPolling();
      }
    };

    // Start initial polling
    startPolling();

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const contextValue: NotificationContextType = {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    isLoading: state.isLoading,
    isLoadingMore: state.isLoadingMore,
    hasMore: state.hasMore,
    currentPage: state.currentPage,
    fetchNotifications,
    loadMoreNotifications,
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