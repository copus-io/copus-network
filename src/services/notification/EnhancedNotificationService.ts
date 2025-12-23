// 增强消息服务 - 使用统一消息工厂的高级服务
// Enhanced Notification Service - Advanced service using unified message factory

import { apiRequest } from '../api';
import {
  NotificationMessageFactory,
  ProcessedNotification,
  RawApiMessage,
  NotificationType
} from './NotificationMessageFactory';

export interface NotificationListResponse {
  data: ProcessedNotification[];
  hasMore: boolean;
  totalCount: number;
  currentPage: number;
  pageCount?: number;
}

export interface NotificationFilters {
  type?: NotificationType | 'all';
  isRead?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface NotificationStatistics {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  recentActivity: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

/**
 * 增强的消息服务类
 * 提供更强大的消息管理功能
 */
export class EnhancedNotificationService {
  // 缓存配置
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟
  private static cache = new Map<string, { data: any; timestamp: number }>();

  /**
   * 获取消息列表 - 增强版
   */
  static async getNotifications(
    page: number = 1,
    pageSize: number = 20,
    filters: NotificationFilters = {}
  ): Promise<NotificationListResponse> {
    try {
      // 构建查询参数
      const params = new URLSearchParams({
        pageIndex: page.toString(),
        pageSize: pageSize.toString(),
      });

      // 类型过滤
      if (filters.type && filters.type !== 'all') {
        const msgType = this.mapTypeToApiCode(filters.type);
        params.append('msgType', msgType.toString());
      } else {
        params.append('msgType', '0'); // 默认获取所有类型
      }

      // 已读状态过滤
      if (filters.isRead !== undefined) {
        params.append('isRead', filters.isRead ? '1' : '0');
      }

      console.log(`[EnhancedNotificationService] Fetching notifications:`, {
        page,
        pageSize,
        filters,
        queryParams: params.toString()
      });

      const response: any = await apiRequest(
        `/client/user/msg/pageMsg?${params.toString()}`,
        {
          method: 'GET',
          requiresAuth: true,
        }
      );

      // 解析响应数据
      let rawMessages: RawApiMessage[] = [];
      let totalCount = 0;
      let pageCount = 0;

      if (response.data && Array.isArray(response.data)) {
        rawMessages = response.data;
        totalCount = response.totalCount || 0;
        pageCount = response.pageCount || 0;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        rawMessages = response.data.data;
        totalCount = response.data.totalCount || response.totalCount || 0;
        pageCount = response.data.pageCount || response.pageCount || 0;
      }

      // 使用消息工厂处理原始消息
      const processedNotifications = NotificationMessageFactory.createNotifications(rawMessages);

      // 应用客户端过滤器
      const filteredNotifications = this.applyClientFilters(processedNotifications, filters);

      const hasMore = filteredNotifications.length === pageSize && (pageCount === 0 || page < pageCount);

      const result = {
        data: filteredNotifications,
        hasMore,
        totalCount,
        currentPage: page,
        pageCount
      };

      // 缓存结果
      this.setCacheData(`notifications_${page}_${pageSize}_${JSON.stringify(filters)}`, result);

      return result;

    } catch (error) {
      console.error('❌ Enhanced notification service error:', error);

      // 返回空结果而不是抛出错误
      return {
        data: [],
        hasMore: false,
        totalCount: 0,
        currentPage: page,
        pageCount: 0
      };
    }
  }

  /**
   * 获取消息统计信息
   */
  static async getStatistics(): Promise<NotificationStatistics> {
    try {
      // 检查缓存
      const cached = this.getCacheData('notification_stats');
      if (cached) return cached;

      // 获取最近的消息进行统计分析
      const recentNotifications = await this.getNotifications(1, 100);

      const stats: NotificationStatistics = {
        total: recentNotifications.totalCount,
        unread: recentNotifications.data.filter(n => !n.isRead).length,
        byType: this.calculateTypeStatistics(recentNotifications.data),
        recentActivity: this.calculateRecentActivity(recentNotifications.data)
      };

      // 缓存统计结果
      this.setCacheData('notification_stats', stats);

      return stats;

    } catch (error) {
      console.error('❌ Failed to get notification statistics:', error);
      return {
        total: 0,
        unread: 0,
        byType: {} as Record<NotificationType, number>,
        recentActivity: { today: 0, thisWeek: 0, thisMonth: 0 }
      };
    }
  }

  /**
   * 标记单条消息为已读 - 增强版
   */
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const response: any = await apiRequest('/client/user/msg/markOneRead', {
        method: 'POST',
        requiresAuth: true,
        body: JSON.stringify({ id: parseInt(notificationId) }),
      });

      const success = response.status === 1;

      if (success) {
        // 清除相关缓存
        this.clearNotificationCaches();
      }

      return success;
    } catch (error) {
      console.error('❌ Failed to mark notification as read:', error);
      return false;
    }
  }

  /**
   * 批量标记多条消息为已读
   */
  static async markMultipleAsRead(notificationIds: string[]): Promise<boolean> {
    try {
      const results = await Promise.allSettled(
        notificationIds.map(id => this.markAsRead(id))
      );

      // 检查是否所有操作都成功
      const allSuccessful = results.every(
        result => result.status === 'fulfilled' && result.value === true
      );

      return allSuccessful;
    } catch (error) {
      console.error('❌ Failed to mark multiple notifications as read:', error);
      return false;
    }
  }

  /**
   * 按类型标记已读
   */
  static async markTypeAsRead(type: NotificationType): Promise<boolean> {
    try {
      const notifications = await this.getNotifications(1, 100, { type, isRead: false });
      const unreadIds = notifications.data
        .filter(n => !n.isRead)
        .map(n => n.id);

      if (unreadIds.length === 0) return true;

      return await this.markMultipleAsRead(unreadIds);
    } catch (error) {
      console.error('❌ Failed to mark type notifications as read:', error);
      return false;
    }
  }

  /**
   * 删除消息 - 增强版
   */
  static async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const response: any = await apiRequest('/client/user/msg/deleteOne', {
        method: 'POST',
        requiresAuth: true,
        body: JSON.stringify({ id: parseInt(notificationId) }),
      });

      const success = response.status === 1 || response === true || response.data === true;

      if (success) {
        // 清除相关缓存
        this.clearNotificationCaches();
      }

      return success;
    } catch (error) {
      console.error('❌ Failed to delete notification:', error);
      return false;
    }
  }

  /**
   * 批量删除消息
   */
  static async deleteMultipleNotifications(notificationIds: string[]): Promise<boolean> {
    try {
      const results = await Promise.allSettled(
        notificationIds.map(id => this.deleteNotification(id))
      );

      const successCount = results.filter(
        result => result.status === 'fulfilled' && result.value === true
      ).length;

      console.log(`Deleted ${successCount}/${notificationIds.length} notifications`);
      return successCount > 0;
    } catch (error) {
      console.error('❌ Failed to delete multiple notifications:', error);
      return false;
    }
  }

  /**
   * 创建新的本地通知（用于实时通知）
   */
  static createLocalNotification(
    type: NotificationType,
    title: string,
    message: string,
    metadata: any = {}
  ): ProcessedNotification {
    return NotificationMessageFactory.createSystemNotification(
      `local_${Date.now()}`,
      message,
      title
    );
  }

  // ===== 私有辅助方法 =====

  /**
   * 映射内部类型到API消息类型码
   */
  private static mapTypeToApiCode(type: NotificationType): number {
    const mapping: Record<NotificationType, number> = {
      [NotificationType.LIKE]: 1,
      [NotificationType.COMMENT]: 2,
      [NotificationType.FOLLOW]: 3,
      [NotificationType.TREASURY]: 4,
      [NotificationType.MENTION]: 5,
      [NotificationType.SYSTEM]: 999
    };
    return mapping[type] || 0;
  }

  /**
   * 应用客户端过滤器
   */
  private static applyClientFilters(
    notifications: ProcessedNotification[],
    filters: NotificationFilters
  ): ProcessedNotification[] {
    let filtered = [...notifications];

    // 日期范围过滤
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      filtered = filtered.filter(n => {
        const date = new Date(n.timestamp);
        return date >= start && date <= end;
      });
    }

    return filtered;
  }

  /**
   * 计算类型统计
   */
  private static calculateTypeStatistics(notifications: ProcessedNotification[]): Record<NotificationType, number> {
    const stats = {} as Record<NotificationType, number>;

    Object.values(NotificationType).forEach(type => {
      stats[type] = 0;
    });

    notifications.forEach(notification => {
      stats[notification.type] = (stats[notification.type] || 0) + 1;
    });

    return stats;
  }

  /**
   * 计算近期活动统计
   */
  private static calculateRecentActivity(notifications: ProcessedNotification[]): {
    today: number;
    thisWeek: number;
    thisMonth: number;
  } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      today: notifications.filter(n => new Date(n.timestamp) >= today).length,
      thisWeek: notifications.filter(n => new Date(n.timestamp) >= thisWeek).length,
      thisMonth: notifications.filter(n => new Date(n.timestamp) >= thisMonth).length
    };
  }

  /**
   * 缓存操作
   */
  private static setCacheData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private static getCacheData(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private static clearNotificationCaches(): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(
      key => key.startsWith('notifications_') || key === 'notification_stats'
    );

    keysToDelete.forEach(key => this.cache.delete(key));
  }
}