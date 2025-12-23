// 消息提醒封装工厂 - 统一消息格式化和处理
// Notification Message Factory - Unified message formatting and processing

export interface RawApiMessage {
  id: number | string;
  messageType: number; // 0=all, 1=like, 2=comment, 999=system
  content: string;
  createdAt: number; // timestamp in seconds
  isRead: boolean;
  senderInfo?: {
    id: number | string;
    username: string;
    namespace?: string;
    faceUrl?: string;
  };
  targetInfo?: {
    id: string;
    uuid?: string;
    title?: string;
    type: 'article' | 'treasury' | 'comment' | 'user';
  };
}

export interface ProcessedNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  avatar: string;
  timestamp: number; // milliseconds
  isRead: boolean;
  actionUrl?: string;
  metadata: NotificationMetadata;
}

export enum NotificationType {
  LIKE = 'like',
  COMMENT = 'comment',
  FOLLOW = 'follow',
  SYSTEM = 'system',
  TREASURY = 'treasury',
  MENTION = 'mention'
}

export interface NotificationMetadata {
  senderId?: string;
  senderUsername?: string;
  senderNamespace?: string;
  targetId?: string;
  targetUuid?: string;
  targetType?: 'article' | 'treasury' | 'comment' | 'user';
  targetTitle?: string;
  actionType?: string;
  extra?: Record<string, any>;
}

/**
 * 消息模板系统 - 支持多语言和自定义格式
 */
export class NotificationTemplates {
  // 消息模板映射
  private static templates: Record<NotificationType, {
    title: string;
    messageTemplate: (data: any) => string;
    actionUrl?: (data: any) => string;
  }> = {
    [NotificationType.LIKE]: {
      title: '获得点赞',
      messageTemplate: (data) => `${data.senderUsername} 赞了你的作品「${data.targetTitle}」`,
      actionUrl: (data) => `/article/${data.targetUuid || data.targetId}`
    },
    [NotificationType.COMMENT]: {
      title: '新评论',
      messageTemplate: (data) => `${data.senderUsername} 评论了你的作品「${data.targetTitle}」`,
      actionUrl: (data) => `/article/${data.targetUuid || data.targetId}#comments`
    },
    [NotificationType.FOLLOW]: {
      title: '新关注',
      messageTemplate: (data) => `${data.senderUsername} 关注了你`,
      actionUrl: (data) => `/u/${data.senderNamespace || data.senderUsername}`
    },
    [NotificationType.TREASURY]: {
      title: '收藏提醒',
      messageTemplate: (data) => `${data.senderUsername} 将你的作品「${data.targetTitle}」加入了收藏`,
      actionUrl: (data) => `/article/${data.targetUuid || data.targetId}`
    },
    [NotificationType.MENTION]: {
      title: '提及提醒',
      messageTemplate: (data) => `${data.senderUsername} 在评论中提到了你`,
      actionUrl: (data) => `/article/${data.targetUuid || data.targetId}#comment-${data.targetId}`
    },
    [NotificationType.SYSTEM]: {
      title: '系统通知',
      messageTemplate: (data) => data.content || '系统消息',
      actionUrl: () => undefined
    }
  };

  /**
   * 根据类型和数据生成格式化消息
   */
  static formatMessage(type: NotificationType, data: any): { title: string; message: string; actionUrl?: string } {
    const template = this.templates[type];
    if (!template) {
      return {
        title: '未知消息',
        message: '收到一条未知类型的消息'
      };
    }

    return {
      title: template.title,
      message: template.messageTemplate(data),
      actionUrl: template.actionUrl?.(data)
    };
  }

  /**
   * 注册自定义消息模板
   */
  static registerTemplate(type: NotificationType, template: {
    title: string;
    messageTemplate: (data: any) => string;
    actionUrl?: (data: any) => string;
  }) {
    this.templates[type] = template;
  }
}

/**
 * 消息内容处理器 - 处理复杂的API内容格式
 */
export class MessageContentProcessor {
  /**
   * 从API消息内容中提取结构化数据
   */
  static extractContentData(content: string): {
    targetTitle?: string;
    targetId?: string;
    targetUuid?: string;
    parsedData?: any;
  } {
    if (!content) return {};

    // 尝试解析JSON内容
    if (content.startsWith('{') && content.endsWith('}')) {
      try {
        const parsed = JSON.parse(content);
        return {
          targetTitle: parsed.title || parsed.content || parsed.message,
          targetId: parsed.id?.toString(),
          targetUuid: parsed.uuid,
          parsedData: parsed
        };
      } catch (error) {
        console.warn('Failed to parse JSON content:', error);
      }
    }

    // 处理HTML内容
    if (content.includes('<')) {
      const cleanContent = content
        .replace(/<[^>]*>/g, '') // 移除HTML标签
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .trim();

      return { targetTitle: cleanContent };
    }

    return { targetTitle: content };
  }

  /**
   * 清理和格式化文本内容
   */
  static sanitizeText(text: string, maxLength: number = 100): string {
    if (!text) return '';

    return text
      .replace(/\s+/g, ' ') // 合并多个空白字符
      .trim()
      .substring(0, maxLength) + (text.length > maxLength ? '...' : '');
  }
}

/**
 * 消息类型识别器 - 智能识别消息类型
 */
export class MessageTypeDetector {
  /**
   * 根据API消息类型码转换为内部类型
   */
  static detectType(apiMessageType: number, content?: string): NotificationType {
    switch (apiMessageType) {
      case 1:
        return NotificationType.LIKE;
      case 2:
        return NotificationType.COMMENT;
      case 3:
        return NotificationType.FOLLOW;
      case 4:
        return NotificationType.TREASURY;
      case 5:
        return NotificationType.MENTION;
      case 999:
        return NotificationType.SYSTEM;
      case 0:
      default:
        // 智能检测：基于内容判断类型
        return this.detectByContent(content);
    }
  }

  /**
   * 基于内容智能检测消息类型
   */
  private static detectByContent(content?: string): NotificationType {
    if (!content) return NotificationType.SYSTEM;

    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('like') || lowerContent.includes('赞')) {
      return NotificationType.LIKE;
    }
    if (lowerContent.includes('comment') || lowerContent.includes('评论')) {
      return NotificationType.COMMENT;
    }
    if (lowerContent.includes('follow') || lowerContent.includes('关注')) {
      return NotificationType.FOLLOW;
    }
    if (lowerContent.includes('treasury') || lowerContent.includes('收藏')) {
      return NotificationType.TREASURY;
    }
    if (lowerContent.includes('mention') || lowerContent.includes('@')) {
      return NotificationType.MENTION;
    }

    return NotificationType.SYSTEM;
  }
}

/**
 * 消息工厂主类 - 统一消息处理入口
 */
export class NotificationMessageFactory {
  /**
   * 将原始API消息转换为标准化通知对象
   */
  static createNotification(rawMessage: RawApiMessage): ProcessedNotification {
    // 1. 检测消息类型
    const type = MessageTypeDetector.detectType(rawMessage.messageType, rawMessage.content);

    // 2. 提取内容数据
    const contentData = MessageContentProcessor.extractContentData(rawMessage.content);

    // 3. 准备模板数据
    const templateData = {
      senderUsername: rawMessage.senderInfo?.username || '用户',
      senderNamespace: rawMessage.senderInfo?.namespace,
      targetTitle: MessageContentProcessor.sanitizeText(contentData.targetTitle || '作品'),
      targetId: contentData.targetId,
      targetUuid: contentData.targetUuid,
      content: rawMessage.content,
      ...contentData.parsedData
    };

    // 4. 使用模板生成消息
    const formattedMessage = NotificationTemplates.formatMessage(type, templateData);

    // 5. 构建元数据
    const metadata: NotificationMetadata = {
      senderId: rawMessage.senderInfo?.id?.toString(),
      senderUsername: rawMessage.senderInfo?.username,
      senderNamespace: rawMessage.senderInfo?.namespace,
      targetId: contentData.targetId || rawMessage.targetInfo?.id,
      targetUuid: contentData.targetUuid || rawMessage.targetInfo?.uuid,
      targetType: rawMessage.targetInfo?.type,
      targetTitle: contentData.targetTitle,
      actionType: type,
      extra: contentData.parsedData
    };

    return {
      id: rawMessage.id.toString(),
      type,
      title: formattedMessage.title,
      message: formattedMessage.message,
      avatar: rawMessage.senderInfo?.faceUrl || '/default-avatar.svg',
      timestamp: rawMessage.createdAt * 1000, // 转换为毫秒
      isRead: rawMessage.isRead,
      actionUrl: formattedMessage.actionUrl,
      metadata
    };
  }

  /**
   * 批量处理多条消息
   */
  static createNotifications(rawMessages: RawApiMessage[]): ProcessedNotification[] {
    return rawMessages.map(message => this.createNotification(message));
  }

  /**
   * 创建系统消息
   */
  static createSystemNotification(
    id: string,
    message: string,
    title: string = '系统通知'
  ): ProcessedNotification {
    return {
      id,
      type: NotificationType.SYSTEM,
      title,
      message,
      avatar: '/system-avatar.svg',
      timestamp: Date.now(),
      isRead: false,
      metadata: {
        actionType: 'system'
      }
    };
  }
}