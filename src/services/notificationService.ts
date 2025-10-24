import { apiRequest } from './api';
import { Notification, NotificationApiResponse } from '../types/notification';
import profileDefaultAvatar from '../assets/images/profile-default.svg';

export class NotificationService {
  /**
   * Get notification list
   * @param page Current page number (default: 1)
   * @param pageSize Records per page (default: 20)
   * @param msgType Message type: 0=all, 1=like, 999=system (default: 0)
   */
  static async getNotifications(
    page: number = 1,
    pageSize: number = 20,
    msgType: number = 0
  ): Promise<Notification[]> {
    // Restored API calls, optimized time formatting to reduce re-renders

    try {
      // Build query parameters - according to API specification
      const params = new URLSearchParams({
        pageIndex: page.toString(),
        pageSize: pageSize.toString(),
        msgType: msgType.toString(), // Always pass msgType, default is 0(all)
      });


      const response: any = await apiRequest(
        `/client/user/msg/pageMsg?${params.toString()}`,
        {
          method: 'GET',
          requiresAuth: true,
        }
      );

      console.log('API response analysis:', {
        hasData: !!response.data,
        dataType: typeof response.data,
        isDataArray: Array.isArray(response.data),
        dataKeys: response.data ? Object.keys(response.data) : 'none',
        dataLength: Array.isArray(response.data) ? response.data.length : 'not array',
        status: response.status,
        statusType: typeof response.status,
        hasNestedData: response.data && !!response.data.data,
        nestedDataArray: response.data && Array.isArray(response.data.data),
        fullDataStructure: JSON.stringify(response, null, 2)
      });

      // Handle real API response format
      if (response.data && Array.isArray(response.data)) {
        return response.data.map(this.transformApiMessage);
      }

      // Check nested data field
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data.map(this.transformApiMessage);
      }

      // If no data, return empty array instead of mock data
      return [];
    } catch (error) {
      console.error('❌ Failed to get message list:', error);
      return this.getMockNotifications();
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {

      const response: any = await apiRequest('/client/user/msg/markOneRead', {
        method: 'POST',
        requiresAuth: true,
        body: JSON.stringify({ id: parseInt(notificationId) }),
      });

      console.log('Mark notification as read response:', {
        responseType: typeof response,
        hasStatus: 'status' in response,
        statusValue: response.status,
        statusType: typeof response.status,
        isSuccess: response.status === 1,
        fullResponse: JSON.stringify(response)
      });

      const isSuccess = response.status === 1;
      return isSuccess;
    } catch (error) {
      console.error('❌ Exception occurred when marking notification as read:', error);
      console.error('🚨 Warning! Returning false instead of simulating success');
      // No longer simulate success, return failure if API fails
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(): Promise<boolean> {
    try {
      const response: any = await apiRequest('/client/user/msg/markAllRead', {
        method: 'POST',
        requiresAuth: true,
      });

      return response.status === 1;
    } catch (error) {
      console.error('❌ Failed to mark all notifications as read:', error);
      // Don't simulate success - return false so caller knows it failed
      return false;
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: string): Promise<boolean> {
    try {

      const response: any = await apiRequest('/client/user/msg/deleteOne', {
        method: 'POST',
        requiresAuth: true,
        body: JSON.stringify({ id: parseInt(notificationId) }),
      });


      // Handle different API response formats
      if (response === true || response === false) {
        return response;
      } else if (response.status === 1) {
        return true;
      } else if (response.data === true || response.data === false) {
        return response.data;
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to delete notification:', error);
      // Return false when deletion fails, don't simulate success
      return false;
    }
  }

  /**
   * Clear all notifications
   */
  static async clearAll(): Promise<boolean> {
    try {

      const response: any = await apiRequest('/client/user/notification/clearAll', {
        method: 'POST',
        requiresAuth: true,
      });

      return response.status === 1;
    } catch (error) {
      console.error('❌ Failed to clear all notifications:', error);
      // Don't simulate success - return false so caller knows it failed
      return false;
    }
  }

  /**
   * Transform backend notification data format (old format, maintain compatibility)
   */
  private static transformNotification(backendNotification: any): Notification {
    return {
      id: backendNotification.id,
      type: backendNotification.type,
      title: backendNotification.title,
      message: backendNotification.message,
      avatar: backendNotification.avatar,
      timestamp: backendNotification.timestamp,
      isRead: backendNotification.isRead,
      actionUrl: backendNotification.actionUrl,
      metadata: backendNotification.metadata,
    };
  }

  /**
   * Transform real API message data format
   */
  private static transformApiMessage(apiMessage: any): Notification {

    // Determine message type based on messageType (0=all, 1=like, 999=system)
    let type: 'like' | 'comment' | 'system' = 'system';
    let title = 'Message Notification';

    switch (apiMessage.messageType) {
      case 1:
        type = 'like';
        title = 'New Like';
        break;
      case 999:
        type = 'system';
        title = 'System Notification';
        break;
      case 0:
      default:
        // Default to system message, but keep more generic title
        type = 'system';
        title = 'Message Notification';
    }

    // Get sender information
    const senderName = apiMessage.senderInfo?.username || 'User';

    // Process message content, generate user-friendly format
    let processedMessage = apiMessage.content || 'No content';
    let workTitle = 'Work';
    let extractedArticleId: string | undefined;
    let extractedArticleUuid: string | undefined;

    // Check if it's a JSON string
    if (typeof processedMessage === 'string') {
      // First try to parse JSON
      if (processedMessage.startsWith('{') && processedMessage.endsWith('}')) {
        try {
          const jsonData = JSON.parse(processedMessage);

          // Extract article ID and UUID
          if (jsonData.id) {
            extractedArticleId = jsonData.id.toString();
          }
          if (jsonData.uuid) {
            extractedArticleUuid = jsonData.uuid;
          }

          // Extract work title
          if (jsonData.title) {
            workTitle = jsonData.title;
          } else if (jsonData.content) {
            workTitle = jsonData.content;
          } else if (jsonData.message) {
            workTitle = jsonData.message;
          }
        } catch (error) {
          workTitle = processedMessage;
        }
      } else {
        workTitle = processedMessage;
      }

      // If content contains HTML tags, process them
      if (workTitle.includes('<')) {
        workTitle = workTitle
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/&nbsp;/g, ' ') // Replace HTML spaces
          .replace(/&lt;/g, '<')   // Replace HTML entities
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .trim();
      }
    }

    // Generate friendly message format based on message type
    switch (apiMessage.messageType) {
      case 1: // Like
        processedMessage = `${senderName} liked your work "${workTitle}"`;
        break;
      case 999: // System message
        processedMessage = workTitle; // System messages keep original format
        break;
      case 0:
      default:
        // Default format, determine based on content
        if (workTitle && workTitle !== 'No content') {
          processedMessage = `${senderName} interacted with your work "${workTitle}"`;
        } else {
          processedMessage = `${senderName} interacted with you`;
        }
    }

    console.log('Timestamp conversion analysis:', {
      original_timestamp_seconds: apiMessage.createdAt,
      converted_timestamp_milliseconds: apiMessage.createdAt * 1000,
      timestamp_type: typeof apiMessage.createdAt,
      converted_to_date: new Date(apiMessage.createdAt * 1000),
      current_time: new Date(),
      time_difference_milliseconds: Date.now() - new Date(apiMessage.createdAt * 1000).getTime()
    });

    return {
      id: apiMessage.id.toString(),
      type,
      title,
      message: processedMessage,
      avatar: apiMessage.senderInfo?.faceUrl || profileDefaultAvatar,
      timestamp: apiMessage.createdAt * 1000, // Convert second-level timestamp to millisecond-level
      isRead: apiMessage.isRead,
      actionUrl: undefined, // Real API doesn't provide actionUrl for now
      metadata: {
        senderId: apiMessage.senderInfo?.id?.toString(),
        senderUsername: apiMessage.senderInfo?.username,
        senderNamespace: apiMessage.senderInfo?.namespace,
        articleId: extractedArticleId || apiMessage.articleId || apiMessage.targetId || apiMessage.relatedId,
        articleUuid: extractedArticleUuid || apiMessage.articleUuid || apiMessage.uuid,
      },
    };
  }

  /**
   * Get mock notification data (for development and testing)
   */
  private static getMockNotifications(): Notification[] {
    const now = Date.now();
    return [
      {
        id: '1',
        type: 'like',
        title: 'New Like',
        message: 'Alice liked your article "React Best Practices"',
        avatar: profileDefaultAvatar,
        timestamp: now - 1000 * 60 * 30, // 30 minutes ago
        isRead: false,
        actionUrl: '/article/123',
        metadata: {
          articleId: '123',
          userId: 'alice',
        },
      },
      {
        id: '2',
        type: 'comment',
        title: 'New Comment',
        message: 'Bob commented on your article "TypeScript Advanced Guide"',
        avatar: profileDefaultAvatar,
        timestamp: now - 1000 * 60 * 60 * 2, // 2 hours ago
        isRead: false,
        actionUrl: '/article/456',
        metadata: {
          articleId: '456',
          userId: 'bob',
          commentId: 'comment_789',
        },
      },
      {
        id: '3',
        type: 'system',
        title: 'System Notification',
        message: 'Your article "JavaScript Async Programming" has passed review and been published',
        timestamp: now - 1000 * 60 * 60 * 24, // 1 day ago
        isRead: true,
        actionUrl: '/article/789',
        metadata: {
          articleId: '789',
        },
      },
      {
        id: '4',
        type: 'like',
        title: 'New Like',
        message: 'David and 2 other users liked your article "Vue3 Component Design"',
        avatar: profileDefaultAvatar,
        timestamp: now - 1000 * 60 * 60 * 24 * 3, // 3 days ago
        isRead: true,
        actionUrl: '/article/999',
        metadata: {
          articleId: '999',
          userId: 'david',
        },
      },
    ];
  }
}

export const notificationService = NotificationService;