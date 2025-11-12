import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService } from '../../services/notificationService';
import { queryKeys, cacheConfig } from '../../lib/queryClient';

// 通知列表查询
export const useNotificationsQuery = (
  page: number = 1,
  pageSize: number = 20,
  msgType: number = 0
) => {
  return useQuery({
    queryKey: queryKeys.notificationsList(), // 暂时不包含参数，避免过多缓存
    queryFn: () => NotificationService.getNotifications(page, pageSize, msgType),
    ...cacheConfig.realtime, // 通知是实时数据，使用短缓存
    staleTime: 30 * 1000, // 30秒
    retry: 2,
    refetchInterval: 60 * 1000, // 60秒轮询
  });
};

// 未读通知数量查询（可以基于通知列表计算）
export const useUnreadNotificationsQuery = () => {
  return useQuery({
    queryKey: queryKeys.notificationsUnread(),
    queryFn: async () => {
      const notifications = await NotificationService.getNotifications(1, 100, 0);
      return notifications.filter(notification => !notification.isRead).length;
    },
    ...cacheConfig.realtime,
    staleTime: 30 * 1000, // 30秒
    refetchInterval: 60 * 1000, // 60秒轮询
  });
};

// 标记通知为已读 mutation
export const useMarkNotificationAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      NotificationService.markAsRead(notificationId),
    onSuccess: () => {
      // 重新获取通知列表和未读数量
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
};

// 标记所有通知为已读 mutation
export const useMarkAllNotificationsAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => NotificationService.markAllAsRead(),
    onSuccess: () => {
      // 重新获取通知列表和未读数量
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
};

// 删除通知 mutation
export const useDeleteNotificationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      NotificationService.deleteNotification(notificationId),
    onSuccess: () => {
      // 重新获取通知列表和未读数量
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
};

// 清空所有通知 mutation
export const useClearAllNotificationsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => NotificationService.clearAll(),
    onSuccess: () => {
      // 重新获取通知列表和未读数量
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
};