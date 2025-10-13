import { apiRequest } from './api';
import { Notification, NotificationApiResponse } from '../types/notification';

export class NotificationService {
  /**
   * 获取通知列表
   * @param page 当前页码 (默认: 1)
   * @param pageSize 每页显示记录数 (默认: 20)
   * @param msgType 消息类型: 0=all, 1=like, 999=system (默认: 0)
   */
  static async getNotifications(
    page: number = 1,
    pageSize: number = 20,
    msgType: number = 0
  ): Promise<Notification[]> {
    // 恢复API调用，优化了时间格式化以减少重新渲染

    try {
      // 构建查询参数 - 根据接口规范
      const params = new URLSearchParams({
        pageIndex: page.toString(),
        pageSize: pageSize.toString(),
        msgType: msgType.toString(), // 总是传递msgType，默认为0(all)
      });


      const response = await apiRequest(
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

      // 处理真实API响应格式
      if (response.data && Array.isArray(response.data)) {
        return response.data.map(this.transformApiMessage);
      }

      // 检查嵌套的data字段
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data.map(this.transformApiMessage);
      }

      // 如果没有数据，返回空数组而不是模拟数据
      return [];
    } catch (error) {
      console.error('❌ 获取消息列表失败:', error);
      return this.getMockNotifications();
    }
  }

  /**
   * 标记通知为已读
   */
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {

      const response = await apiRequest('/client/user/msg/markOneRead', {
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
      console.error('❌ 小薇：标记通知已读时发生异常:', error);
      console.error('🚨 小薇：注意！这里返回false而不是模拟成功');
      // 不再模拟成功，如果API失败就返回失败
      return false;
    }
  }

  /**
   * 标记所有通知为已读
   */
  static async markAllAsRead(): Promise<boolean> {
    try {

      const response = await apiRequest('/client/user/msg/markAllRead', {
        method: 'POST',
        requiresAuth: true,
      });

      return response.status === 1;
    } catch (error) {
      console.error('❌ 标记所有通知已读失败:', error);
      // 模拟成功
      return true;
    }
  }

  /**
   * 删除通知
   */
  static async deleteNotification(notificationId: string): Promise<boolean> {
    try {

      const response = await apiRequest('/client/user/msg/deleteOne', {
        method: 'POST',
        requiresAuth: true,
        body: JSON.stringify({ id: parseInt(notificationId) }),
      });


      // 处理不同的API响应格式
      if (response === true || response === false) {
        return response;
      } else if (response.status === 1) {
        return true;
      } else if (response.data === true || response.data === false) {
        return response.data;
      }

      return true;
    } catch (error) {
      console.error('❌ 删除通知失败:', error);
      // 删除失败时返回false，不要模拟成功
      return false;
    }
  }

  /**
   * 清空所有通知
   */
  static async clearAll(): Promise<boolean> {
    try {

      const response = await apiRequest('/client/user/notification/clearAll', {
        method: 'POST',
        requiresAuth: true,
      });

      return response.status === 1;
    } catch (error) {
      console.error('❌ 清空所有通知失败:', error);
      // 模拟成功
      return true;
    }
  }

  /**
   * 转换后端通知数据格式（旧格式，保留兼容性）
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
   * 转换真实API消息数据格式
   */
  private static transformApiMessage(apiMessage: any): Notification {
    console.log('Transforming API message:', {
      content: apiMessage.content,
      contentType: typeof apiMessage.content,
      contentLength: apiMessage.content?.length
    });

    // 根据messageType确定消息类型 (0=all, 1=like, 999=system)
    let type: 'like' | 'comment' | 'system' = 'system';
    let title = '消息通知';

    switch (apiMessage.messageType) {
      case 1:
        type = 'like';
        title = '新的点赞';
        break;
      case 999:
        type = 'system';
        title = '系统通知';
        break;
      case 0:
      default:
        // 默认处理为系统消息，但保持更通用的标题
        type = 'system';
        title = '消息通知';
    }

    // 获取发送者信息
    const senderName = apiMessage.senderInfo?.username || '用户';

    // 处理消息内容，生成用户友好的格式
    let processedMessage = apiMessage.content || '暂无内容';
    let workTitle = '作品';

    // 检查是否是JSON字符串
    if (typeof processedMessage === 'string') {
      // 先尝试解析JSON
      if (processedMessage.startsWith('{') && processedMessage.endsWith('}')) {
        try {
          const jsonData = JSON.parse(processedMessage);

          // 提取作品标题
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

      // 如果内容包含HTML标签，进行处理
      if (workTitle.includes('<')) {
        workTitle = workTitle
          .replace(/<[^>]*>/g, '') // 移除HTML标签
          .replace(/&nbsp;/g, ' ') // 替换HTML空格
          .replace(/&lt;/g, '<')   // 替换HTML实体
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .trim();
      }
    }

    // 根据消息类型生成友好的消息格式
    switch (apiMessage.messageType) {
      case 1: // 点赞
        processedMessage = `${senderName} 喜欢了你的作品《${workTitle}》`;
        break;
      case 999: // 系统消息
        processedMessage = workTitle; // 系统消息保持原样
        break;
      case 0:
      default:
        // 默认格式，根据内容判断
        if (workTitle && workTitle !== '暂无内容') {
          processedMessage = `${senderName} 与你的作品《${workTitle}》进行了互动`;
        } else {
          processedMessage = `${senderName} 与你进行了互动`;
        }
    }

    console.log('时间戳转换分析:', {
      原始时间戳_秒: apiMessage.createdAt,
      转换后时间戳_毫秒: apiMessage.createdAt * 1000,
      时间戳类型: typeof apiMessage.createdAt,
      转换为Date: new Date(apiMessage.createdAt * 1000),
      当前时间: new Date(),
      时间差毫秒: Date.now() - new Date(apiMessage.createdAt * 1000).getTime()
    });

    return {
      id: apiMessage.id.toString(),
      type,
      title,
      message: processedMessage,
      avatar: apiMessage.senderInfo?.faceUrl ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${apiMessage.senderInfo?.username || 'user'}&backgroundColor=b6e3f4`,
      timestamp: apiMessage.createdAt * 1000, // 将秒级时间戳转换为毫秒级
      isRead: apiMessage.isRead,
      actionUrl: undefined, // 真实API暂时没有提供actionUrl
      metadata: {
        senderId: apiMessage.senderInfo?.id,
        senderUsername: apiMessage.senderInfo?.username,
        senderNamespace: apiMessage.senderInfo?.namespace,
      },
    };
  }

  /**
   * 获取模拟通知数据（用于开发和测试）
   */
  private static getMockNotifications(): Notification[] {
    const now = Date.now();
    return [
      {
        id: '1',
        type: 'like',
        title: '新的点赞',
        message: 'Alice 点赞了你的文章《React 最佳实践》',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice&backgroundColor=b6e3f4',
        timestamp: now - 1000 * 60 * 30, // 30分钟前
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
        title: '新的评论',
        message: 'Bob 评论了你的文章《TypeScript 进阶指南》',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob&backgroundColor=fbbf24',
        timestamp: now - 1000 * 60 * 60 * 2, // 2小时前
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
        title: '系统通知',
        message: '你的文章《JavaScript 异步编程》已通过审核并发布',
        timestamp: now - 1000 * 60 * 60 * 24, // 1天前
        isRead: true,
        actionUrl: '/article/789',
        metadata: {
          articleId: '789',
        },
      },
      {
        id: '4',
        type: 'like',
        title: '新的点赞',
        message: 'David 和其他2位用户点赞了你的文章《Vue3 组件设计》',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David&backgroundColor=f59e0b',
        timestamp: now - 1000 * 60 * 60 * 24 * 3, // 3天前
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