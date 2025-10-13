import React, { useEffect, useRef } from 'react';
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

  // 面板打开时加载通知列表
  useEffect(() => {
    if (isOpen) {
      console.log('🔔 用户打开通知面板，立即加载通知列表...');
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // 点击外部关闭面板
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

  // 格式化时间
  const formatTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;

    // 超过7天显示具体日期
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    });
  };

  // 获取通知类型图标
  const getNotificationIcon = (type: string): JSX.Element => {
    switch (type) {
      case 'like':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
        );
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

  // 处理通知点击
  const handleNotificationClick = async (notification: Notification) => {
    // 标记为已读
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // 导航到相关页面
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }

    onClose();
  };

  // 处理标记全部已读
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  // 处理清空所有通知
  const handleClearAll = async () => {
    if (window.confirm('确定要清空所有通知吗？')) {
      await clearAllNotifications();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border z-50" ref={panelRef}>
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="text-lg font-semibold text-gray-900">
          通知 {unreadCount > 0 && <span className="text-red-500">({unreadCount})</span>}
        </h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              全部已读
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              清空
            </button>
          )}
        </div>
      </div>

      {/* 通知列表 */}
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
            <p>暂无通知</p>
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
              {/* 图标或头像 */}
              {notification.avatar ? (
                <img
                  src={notification.avatar}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                getNotificationIcon(notification.type)
              )}

              {/* 内容 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`text-sm ${notification.isRead ? 'text-gray-900' : 'font-medium text-gray-900'}`}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
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

      {/* 底部 */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t bg-gray-50">
          <button
            onClick={() => {
              navigate('/notifications');
              onClose();
            }}
            className="w-full text-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            查看所有通知
          </button>
        </div>
      )}
    </div>
  );
};