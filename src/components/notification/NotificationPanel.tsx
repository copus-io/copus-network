import React, { useEffect, useRef, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { Notification } from '../../types/notification';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, isLoading, fetchNotifications, markAsRead, markAllAsRead, clearAllNotifications } = useNotification();


  // Load notification list when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Format time
  const formatTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    // Show specific date for over 7 days
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Get notification type icon
  const getNotificationIcon = (type: string): JSX.Element => {
    switch (type) {
      case 'comment':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'follow':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
          </div>
        );
      case 'treasury':
        return (
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          </div>
        );
      case 'mention':
        return (
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </div>
        );
      case 'follow_treasury':
        return (
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'comment_reply':
        return (
          <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'comment_like':
        return (
          <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'unlock':
        return (
          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'system':
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  // Render message with clickable work title
  const renderMessageWithLinks = (notification: Notification) => {
    const { message, metadata } = notification;

    console.log('🔍 Checking notification:', {
      type: notification.type,
      message,
      hasMetadata: !!metadata,
      targetTitle: metadata?.targetTitle,
      targetUuid: metadata?.targetUuid
    });

    // For treasury type (type 4), make the work title clickable
    if (notification.type === 'treasury' && metadata?.targetTitle && metadata?.targetUuid) {
      const workTitle = metadata.targetTitle;

      console.log('✅ Treasury notification found, processing:', { workTitle, message });

      // Check if message contains the work title
      if (message.includes(workTitle)) {
        const beforeTitle = message.substring(0, message.indexOf(workTitle));
        const afterTitle = message.substring(message.indexOf(workTitle) + workTitle.length);

        console.log('🎯 Splitting message:', { beforeTitle, workTitle, afterTitle });

        return (
          <>
            {beforeTitle}
            <span
              onClick={(e) => {
                e.stopPropagation();
                console.log('🖱️ Clicking work title, navigating to:', `/work/${metadata.targetUuid}`);
                startTransition(() => { navigate(`/work/${metadata.targetUuid}`); });
                onClose();
              }}
              className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
            >
              {workTitle}
            </span>
            {afterTitle}
          </>
        );
      }
    }

    return message;
  };

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Navigate to related page
    if (notification.actionUrl) {
      startTransition(() => { navigate(notification.actionUrl); });
    }

    onClose();
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  // Handle clear all notifications
  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      await clearAllNotifications();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border z-50" ref={panelRef}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="text-lg font-semibold text-gray-900">
          Notifications {unreadCount > 0 && <span className="text-red-500">({unreadCount})</span>}
        </h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Notification list */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2C11.1046 2 12 2.89543 12 4C12 4.08183 11.9973 4.16302 11.9921 4.24346C14.3833 5.64453 16 8.13261 16 11V14.3052C16 14.6613 16.1442 14.9999 16.4 15.2386L17.0627 15.8481C17.6421 16.3923 17.2561 17.3 16.4721 17.3H12.9381C12.9748 17.4591 13 17.6284 13 17.8C13 19.4569 11.6569 20.8 10 20.8C8.3431 20.8 7 19.4569 7 17.8C7 17.6284 7.02521 17.4591 7.06189 17.3H3.52786C2.74388 17.3 2.35794 16.3923 2.9373 15.8481L3.6 15.2386C3.85584 14.9999 4 14.6613 4 14.3052V11C4 8.13261 5.61665 5.64453 8.00792 4.24346C8.00272 4.16302 8 4.08183 8 4C8 2.89543 8.89543 2 10 2Z" />
            </svg>
            <p>No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${
                notification.isRead ? 'border-transparent' : 'border-blue-500 bg-blue-50'
              }`}
            >
              {/* Icon or avatar */}
              {notification.avatar ? (
                <img
                  src={notification.avatar}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                getNotificationIcon(notification.type)
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`text-sm ${notification.isRead ? 'text-gray-900' : 'font-medium text-gray-900'}`}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{renderMessageWithLinks(notification)}</p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">{formatTime(notification.timestamp)}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t bg-gray-50">
          <button
            onClick={() => {
              startTransition(() => { navigate('/notifications'); });
              onClose();
            }}
            className="w-full text-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};