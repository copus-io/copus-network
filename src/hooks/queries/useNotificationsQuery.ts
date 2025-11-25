import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService } from '../../services/notificationService';
import { queryKeys, cacheConfig } from '../../lib/queryClient';

// Notifications list query
export const useNotificationsQuery = (
  page: number = 1,
  pageSize: number = 20,
  msgType: number = 0
) => {
  return useQuery({
    queryKey: queryKeys.notificationsList(), // Temporarily exclude parameters to avoid excessive caching
    queryFn: () => NotificationService.getNotifications(page, pageSize, msgType),
    ...cacheConfig.realtime, // Notifications are real-time data, use short cache
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
    refetchInterval: 60 * 1000, // 60-second polling
  });
};

// Unread notifications count query (can be calculated based on notifications list)
export const useUnreadNotificationsQuery = () => {
  return useQuery({
    queryKey: queryKeys.notificationsUnread(),
    queryFn: async () => {
      const notifications = await NotificationService.getNotifications(1, 100, 0);
      return notifications.filter(notification => !notification.isRead).length;
    },
    ...cacheConfig.realtime,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 60-second polling
  });
};

// Mark notification as read mutation
export const useMarkNotificationAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      NotificationService.markAsRead(notificationId),
    onSuccess: () => {
      // Refetch notifications list and unread count
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
};

// Mark all notifications as read mutation
export const useMarkAllNotificationsAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => NotificationService.markAllAsRead(),
    onSuccess: () => {
      // Refetch notifications list and unread count
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
};

// Delete notification mutation
export const useDeleteNotificationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      NotificationService.deleteNotification(notificationId),
    onSuccess: () => {
      // Refetch notifications list and unread count
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
};

// Clear all notifications mutation
export const useClearAllNotificationsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => NotificationService.clearAll(),
    onSuccess: () => {
      // Refetch notifications list and unread count
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
};