import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';

interface NotificationBellProps {
  onClick: () => void;
  isOpen: boolean;
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  onClick,
  isOpen,
  className = '',
}) => {
  const { unreadCount } = useNotification();

  return (
    <button
      onClick={onClick}
      className={`relative p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 ${
        isOpen ? 'bg-gray-100' : ''
      } ${className}`}
      title={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
    >
      {/* Bell icon */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-colors duration-200 ${
          isOpen ? 'text-blue-600' : 'text-gray-600'
        }`}
      >
        <path
          d="M12 2C13.1046 2 14 2.89543 14 4C14 4.08183 13.9973 4.16302 13.9921 4.24346C16.3833 5.64453 18 8.13261 18 11V14.3052C18 14.6613 18.1442 14.9999 18.4 15.2386L19.0627 15.8481C19.6421 16.3923 19.2561 17.3 18.4721 17.3H14.9381C14.9748 17.4591 15 17.6284 15 17.8C15 19.4569 13.6569 20.8 12 20.8C10.3431 20.8 9 19.4569 9 17.8C9 17.6284 9.02521 17.4591 9.06189 17.3H5.52786C4.74388 17.3 4.35794 16.3923 4.9373 15.8481L5.6 15.2386C5.85584 14.9999 6 14.6613 6 14.3052V11C6 8.13261 7.61665 5.64453 10.0079 4.24346C10.0027 4.16302 10 4.08183 10 4C10 2.89543 10.8954 2 12 2Z"
          fill="currentColor"
        />
      </svg>

      {/* Unread message count badge */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium leading-none">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}

      {/* Ring animation effect (when there are new notifications) */}
      {unreadCount > 0 && (
        <span className="absolute inset-0 rounded-lg animate-ping bg-blue-400 opacity-20"></span>
      )}
    </button>
  );
};