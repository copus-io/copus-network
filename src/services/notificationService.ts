import { apiRequest } from './api';
import { Notification } from '../types/notification';
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
  ): Promise<{
    data: Notification[];
    hasMore: boolean;
    totalCount?: number;
    pageCount?: number;
    currentPage: number;
  }> {
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

      let notifications: Notification[] = [];
      let totalCount = 0;
      let pageCount = 0;

      // Handle real API response format
      if (response.data && Array.isArray(response.data)) {
        notifications = response.data.map(this.transformApiMessage);
        // For direct array response, estimate pagination info
        totalCount = response.totalCount || 0;
        pageCount = response.pageCount || 0;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // Handle nested data structure
        notifications = response.data.data.map(this.transformApiMessage);
        totalCount = response.data.totalCount || response.totalCount || 0;
        pageCount = response.data.pageCount || response.pageCount || 0;
      }

      // Calculate if there are more pages
      const hasMore = notifications.length === pageSize && (pageCount === 0 || page < pageCount);

      return {
        data: notifications,
        hasMore,
        totalCount,
        pageCount,
        currentPage: page
      };
    } catch (error) {
      console.error(' Failed to get message list:', error);
      
      // Special handling for authentication errors (401/403)
      // When these occur, re-throw the error so global handler can catch it
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('401') || errorMessage.includes('403') || 
            errorMessage.includes('authentication failed') || errorMessage.includes('authorization failed')) {
          // Let the global event handler take care of logout
          throw error;
        }
      }

      // Return empty result instead of mock data when API call fails
      return {
        data: [],
        hasMore: false,
        totalCount: 0,
        pageCount: 0,
        currentPage: page
      };
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

      const isSuccess = response.status === 1;
      return isSuccess;
    } catch (error) {
      console.error('Exception occurred when marking notification as read:', error);
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
      console.error(' Failed to mark all notifications as read:', error);
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
      console.error(' Failed to delete notification:', error);
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
      console.error(' Failed to clear all notifications:', error);
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

    // Determine message type based on messageType
    // API messageType: 1=treasury, 2=comment, 3=unlock/earning, 999=system
    let type: 'comment' | 'follow' | 'system' | 'treasury' | 'mention' | 'follow_treasury' | 'comment_reply' | 'comment_like' | 'unlock' = 'system';
    let title = 'Message Notification';

    switch (apiMessage.messageType) {
      case 1:
        type = 'treasury';
        title = 'New Treasury';
        break;
      case 2:
        type = 'comment';
        title = 'New Comment';
        break;
      case 3:
        type = 'unlock';
        title = 'New Earning';
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
    const senderName = apiMessage.senderInfo?.username || 'Anonymous';

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
      case 1: // Treasury
        processedMessage = `[${senderName}] treasured your share [${workTitle}]`;
        break;
      case 2: // Comment
        processedMessage = `[${senderName}] commented on your share [${workTitle}]`;
        break;
      case 3: // Unlock/Earning
        processedMessage = `You earned from [${workTitle}]`;
        break;
      case 999: // System message
        processedMessage = workTitle; // System messages keep original format
        break;
      case 0:
      default:
        // Default format, determine based on content
        if (workTitle && workTitle !== 'No content') {
          processedMessage = `[${senderName}] interacted with your work [${workTitle}]`;
        } else {
          processedMessage = `[${senderName}] interacted with you`;
        }
    }

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
}

export const notificationService = NotificationService;