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
  COMMENT = 'comment',
  FOLLOW = 'follow',
  SYSTEM = 'system',
  TREASURY = 'treasury',
  MENTION = 'mention',
  FOLLOW_TREASURY = 'follow_treasury',
  COMMENT_REPLY = 'comment_reply',
  COMMENT_LIKE = 'comment_like',
  UNLOCK = 'unlock',
  COLLECT = 'collect'
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
  senderInfo?: {
    id: number | string;
    username: string;
    namespace?: string;
    faceUrl?: string;
  };
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
    [NotificationType.FOLLOW]: {
      title: '新关注',
      messageTemplate: (data) => `[${data.senderUsername}] followed your treasury [${data.targetTitle}]`,
      actionUrl: (data) => `/treasury/${data.spaceNamespace || data.senderNamespace || data.senderUsername}`
    },
    [NotificationType.FOLLOW_TREASURY]: {
      title: '关注空间更新',
      messageTemplate: (data) => `[${data.targetTitle}] you follow has listed a new treasure [${data.articleTitle}]`,
      actionUrl: (data) => `/work/${data.articleUuid || data.articleId}`
    },
    [NotificationType.TREASURY]: {
      title: '作品评论',
      messageTemplate: (data) => `[${data.senderUsername}] commented on your treasure [${data.targetTitle}]${data.commentContent ? ` [${data.commentContent}]` : ''}`,
      actionUrl: (data) => {
        const baseUrl = `/work/${data.targetUuid || data.targetId}`;
        // 使用URL参数和hash双重保证评论区打开和定位
        if (data.commentId) {
          return `${baseUrl}?openComments=true&commentId=${data.commentId}#comment-${data.commentId}`;
        } else {
          return `${baseUrl}?openComments=true#comments`;
        }
      }
    },
    [NotificationType.COMMENT]: {
      title: '新评论',
      messageTemplate: (data) => `[${data.senderUsername}] 评论了你的作品 [${data.targetTitle}]`,
      actionUrl: (data) => `/work/${data.targetUuid || data.targetId}#comments`
    },
    [NotificationType.COMMENT_REPLY]: {
      title: '评论回复',
      messageTemplate: (data) => {
        if (data.commentContent && data.commentContent.trim()) {
          const sanitizedComment = MessageContentProcessor.sanitizeCommentContent(data.commentContent);
          return `[${data.senderUsername}] replied to your comment "${sanitizedComment}"`;
        }
        return `[${data.senderUsername}] replied to your comment`;
      },
      actionUrl: (data) => {
        const baseUrl = `/work/${data.targetUuid || data.targetId}`;
        return data.commentId ? `${baseUrl}?openComments=true&commentId=${data.commentId}#comment-${data.commentId}` : `${baseUrl}?openComments=true#comments`;
      }
    },
    [NotificationType.COMMENT_LIKE]: {
      title: '评论点赞',
      messageTemplate: (data) => {
        if (data.commentContent && data.commentContent.trim()) {
          const sanitizedComment = MessageContentProcessor.sanitizeCommentContent(data.commentContent);
          return `[${data.senderUsername}] liked your comment "${sanitizedComment}"`;
        }
        return `[${data.senderUsername}] liked your comment`;
      },
      actionUrl: (data) => {
        const baseUrl = `/work/${data.targetUuid || data.targetId}`;
        // 点赞通知不定位到具体评论，只打开评论区
        return `${baseUrl}?openComments=true#comments`;
      }
    },
    [NotificationType.UNLOCK]: {
      title: '付费解锁',
      messageTemplate: (data) => `[${data.senderUsername}] unlocked your treasure [${data.targetTitle}] with ${data.price} USD`,
      actionUrl: (data) => `/work/${data.targetUuid || data.targetId}`
    },
    [NotificationType.MENTION]: {
      title: '提及提醒',
      messageTemplate: (data) => `[${data.senderUsername}] 在评论中提到了你`,
      actionUrl: (data) => `/work/${data.targetUuid || data.targetId}#comment-${data.targetId}`
    },
    [NotificationType.COLLECT]: {
      title: '收藏通知',
      messageTemplate: (data) => {
        const spaceNames = data.spaces?.map((space: any) => `[${space.name}]`).join('，') || '[空间]';
        return `[${data.senderUsername}] collected [${data.articleTitle}] in ${spaceNames}`;
      },
      actionUrl: (data) => `/work/${data.articleUuid || data.articleId}`
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

        console.log('[extractContentData] Raw content parsed:', {
          hasSpaceInfo: !!parsed.spaceInfo,
          hasArticleInfo: !!parsed.articleInfo,
          hasCommentInfo: !!parsed.commentInfo,
          topLevelKeys: Object.keys(parsed),
          spaceInfo: parsed.spaceInfo,
          parsed: parsed
        });

        // 处理新的collect类型数据结构 (收藏消息)
        if (parsed.spaces && parsed.articleInfo) {
          return {
            targetTitle: parsed.articleInfo.title,
            targetId: parsed.articleInfo.id?.toString(),
            targetUuid: parsed.articleInfo.uuid,
            parsedData: {
              ...parsed,
              spaces: parsed.spaces,
              articleTitle: parsed.articleInfo.title,
              articleId: parsed.articleInfo.id,
              articleUuid: parsed.articleInfo.uuid
            }
          };
        }

        // 处理新的treasury类型数据结构 (评论消息)
        if (parsed.articleInfo && parsed.commentInfo) {
          return {
            targetTitle: parsed.articleInfo.title,
            targetId: parsed.articleInfo.id?.toString(),
            targetUuid: parsed.articleInfo.uuid,
            parsedData: {
              ...parsed,
              commentContent: parsed.commentInfo.content,
              commentId: parsed.commentInfo.id
            }
          };
        }

        // 处理新的follow_treasury类型数据结构 (关注空间的新作品)
        if (parsed.spaceInfo && parsed.articleInfo) {
          // Keep default space name as "Username's Collections" for follow_treasury
          // Do NOT transform to "Treasury" - user prefers "Collections"
          const spaceName = parsed.spaceInfo.name || '';

          console.log('[extractContentData] follow_treasury spaceInfo details:', {
            spaceId: parsed.spaceInfo.id,
            spaceName: spaceName,
            spaceNamespace: parsed.spaceInfo.namespace,
            hasNamespace: !!parsed.spaceInfo.namespace,
            articleCoverUrl: parsed.articleInfo.coverUrl,
            allSpaceInfoKeys: Object.keys(parsed.spaceInfo),
            allArticleInfoKeys: Object.keys(parsed.articleInfo)
          });
          return {
            targetTitle: spaceName, // 空间名作为目标标题
            targetId: parsed.spaceInfo.id?.toString(),
            parsedData: {
              ...parsed,
              spaceName: spaceName,
              spaceNamespace: parsed.spaceInfo.namespace,
              spaceId: parsed.spaceInfo.id,
              articleTitle: parsed.articleInfo.title,
              articleId: parsed.articleInfo.id,
              articleUuid: parsed.articleInfo.uuid,
              // Use article cover as avatar for follow_treasury notifications
              articleCoverUrl: parsed.articleInfo.coverUrl,
              // Keep author info for reference
              authorFaceUrl: parsed.articleInfo.authorInfo?.faceUrl || parsed.spaceInfo.faceUrl,
              authorUsername: parsed.articleInfo.authorInfo?.username,
              authorNamespace: parsed.articleInfo.authorInfo?.namespace
            }
          };
        }

        // 处理评论点赞/回复数据结构 - 仅包含评论信息
        if (parsed.id && parsed.content && !parsed.articleInfo) {
          return {
            targetTitle: '评论', // 默认标题
            targetId: parsed.id?.toString(),
            parsedData: {
              ...parsed,
              commentContent: parsed.content,
              commentId: parsed.id
            }
          };
        }

        // 处理新的follow类型数据结构（空间信息）- 支持嵌套和扁平结构
        // Handle nested spaceInfo structure (without articleInfo)
        if (parsed.spaceInfo && !parsed.articleInfo) {
          // Transform default space name: "username's Collections" -> "username's Treasury"
          // Note: "Curations" stays as is - it's a different type
          let spaceName = parsed.spaceInfo.name || '';
          if (spaceName.endsWith("'s Collections")) {
            spaceName = spaceName.replace("'s Collections", "'s Treasury");
          }
          return {
            targetTitle: spaceName,
            targetId: parsed.spaceInfo.id?.toString(),
            parsedData: {
              ...parsed,
              spaceName: spaceName,
              spaceNamespace: parsed.spaceInfo.namespace,
              spaceId: parsed.spaceInfo.id,
              spaceFaceUrl: parsed.spaceInfo.faceUrl
            }
          };
        }

        // Handle flat space info structure
        if (parsed.id && parsed.name && parsed.namespace) {
          // Transform default space name: "username's Collections" -> "username's Treasury"
          // Note: "Curations" stays as is - it's a different type
          let spaceName = parsed.name || '';
          if (spaceName.endsWith("'s Collections")) {
            spaceName = spaceName.replace("'s Collections", "'s Treasury");
          }
          return {
            targetTitle: spaceName,
            targetId: parsed.id?.toString(),
            parsedData: {
              ...parsed,
              spaceName: spaceName,
              spaceNamespace: parsed.namespace,
              spaceId: parsed.id,
              spaceFaceUrl: parsed.faceUrl
            }
          };
        }

        // 兼容旧格式
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

    // 处理treasury类型消息：提取作品名称
    const treasuryMatch = content.match(/commented on your treasure\s+(.+)$/);
    if (treasuryMatch) {
      return {
        targetTitle: treasuryMatch[1].trim()
      };
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

  /**
   * 专门处理评论内容的格式化 - 限制长度用于通知显示
   */
  static sanitizeCommentContent(text: string, maxLength: number = 60): string {
    if (!text) return '';

    const cleaned = text
      .replace(/\s+/g, ' ') // 合并多个空白字符
      .trim();

    if (cleaned.length <= maxLength) {
      return cleaned;
    }

    // 超长内容进行中间省略处理
    const halfLength = Math.floor(maxLength / 2) - 2; // 预留 "..." 的空间
    return cleaned.substring(0, halfLength) + '...' + cleaned.substring(cleaned.length - halfLength);
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
      case 2:
        return NotificationType.FOLLOW;
      case 3:
        return NotificationType.FOLLOW_TREASURY;
      case 4:
        return NotificationType.TREASURY;
      case 5:
        return NotificationType.MENTION;
      case 6:
        return NotificationType.COMMENT_REPLY;
      case 7:
        return NotificationType.COMMENT_LIKE;
      case 8:
        return NotificationType.UNLOCK;
      case 9:
        return NotificationType.COLLECT;
      case 999:
        return NotificationType.SYSTEM;
      case 0:
      case 1: // Type 1 不再使用，归类为系统消息
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

    console.log('[createNotification] Processing message:', {
      id: rawMessage.id,
      messageType: rawMessage.messageType,
      detectedType: type,
      senderInfo: rawMessage.senderInfo,
      rawContent: rawMessage.content
    });

    // 2. 提取内容数据
    const contentData = MessageContentProcessor.extractContentData(rawMessage.content);

    console.log('[createNotification] Extracted content data:', {
      contentData,
      parsedDataKeys: contentData.parsedData ? Object.keys(contentData.parsedData) : 'none'
    });

    // 3. 准备模板数据
    const templateData = {
      senderUsername: rawMessage.senderInfo?.username || 'Anonymous',
      senderNamespace: rawMessage.senderInfo?.namespace,
      targetTitle: MessageContentProcessor.sanitizeText(contentData.targetTitle || '作品'),
      targetId: contentData.targetId,
      targetUuid: contentData.targetUuid,
      content: rawMessage.content,
      commentContent: contentData.parsedData?.commentContent,
      commentId: contentData.parsedData?.commentId,
      spaceName: contentData.parsedData?.spaceName,
      spaceNamespace: contentData.parsedData?.spaceNamespace,
      spaceId: contentData.parsedData?.spaceId,
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
      extra: contentData.parsedData,
      // Include full senderInfo for avatar display
      senderInfo: rawMessage.senderInfo
    };

    // Log for follow notifications to debug space namespace issue
    if (type === NotificationType.FOLLOW) {
      console.log('[createNotification] FOLLOW notification metadata:', {
        senderNamespace: metadata.senderNamespace,
        extraSpaceNamespace: metadata.extra?.spaceNamespace,
        extraNamespace: metadata.extra?.namespace,
        extraSpaceName: metadata.extra?.spaceName,
        fullExtra: metadata.extra
      });
    }

    // Determine avatar based on notification type
    const defaultAvatar = "data:image/svg+xml,%3csvg%20width='100'%20height='100'%20viewBox='0%200%20100%20100'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20width='100'%20height='100'%20rx='50'%20fill='white'/%3e%3crect%20width='100'%20height='100'%20rx='50'%20fill='%23E0E0E0'%20fill-opacity='0.4'/%3e%3cpath%20d='M73.9643%2060.6618V60.9375C73.9643%2074.2269%2063.2351%2085%2050%2085C36.7649%2085%2026.0357%2074.2269%2026.0357%2060.9375V60.6618C22.2772%2059.6905%2019.5%2056.2646%2019.5%2052.1875C19.5%2048.1104%2022.2772%2044.6845%2026.0357%2043.7132V39.0625C26.0357%2025.7731%2036.7649%2015%2050%2015C63.2351%2015%2073.9643%2025.7731%2073.9643%2039.0625V43.7132C77.7228%2044.6845%2080.5%2048.1104%2080.5%2052.1875C80.5%2056.2646%2077.7228%2059.6905%2073.9643%2060.6618ZM69.6071%2043.4375H67.2192C62.2208%2043.4375%2057.8638%2040.0217%2056.6515%2035.1527L56.5357%2034.6875L48.85%2038.5461C43.0934%2041.4362%2036.8058%2043.0815%2030.3929%2043.3858V60.9375C30.3929%2071.8106%2039.1713%2080.625%2050%2080.625C60.8287%2080.625%2069.6071%2071.8106%2069.6071%2060.9375V43.4375ZM39.1071%2050C39.1071%2048.7919%2040.0825%2047.8125%2041.2857%2047.8125C42.4889%2047.8125%2043.4643%2048.7919%2043.4643%2050V54.375C43.4643%2055.5831%2042.4889%2056.5625%2041.2857%2056.5625C40.0825%2056.5625%2039.1071%2055.5831%2039.1071%2054.375V50ZM56.5357%2050C56.5357%2048.7919%2057.5111%2047.8125%2058.7143%2047.8125C59.9175%2047.8125%2060.8929%2048.7919%2060.8929%2050V54.375C60.8929%2055.5831%2059.9175%2056.5625%2058.7143%2056.5625C57.5111%2056.5625%2056.5357%2055.5831%2056.5357%2054.375V50ZM41.9964%2071.3039C41.1073%2070.4899%2041.0438%2069.1064%2041.8544%2068.2136C42.6651%2067.3209%2044.0431%2067.2571%2044.9321%2068.0711C46.0649%2069.1081%2047.4581%2069.6875%2048.8886%2069.6875C50.3722%2069.6875%2051.7728%2069.1187%2052.8779%2068.0924C53.7612%2067.2721%2055.1396%2067.3261%2055.9565%2068.2131C56.7735%2069.1%2056.7197%2070.484%2055.8364%2071.3043C53.9384%2073.0668%2051.4869%2074.0625%2048.8886%2074.0625C46.3342%2074.0625%2043.907%2073.0532%2041.9964%2071.3039ZM23.8571%2052.1875C23.8571%2053.8069%2024.7334%2055.2207%2026.0357%2055.9772V48.3978C24.7334%2049.1543%2023.8571%2050.5681%2023.8571%2052.1875ZM76.1429%2052.1875C76.1429%2050.5681%2075.2666%2049.1543%2073.9643%2048.3978V55.9772C75.2666%2055.2207%2076.1429%2053.8069%2076.1429%2052.1875Z'%20fill='black'/%3e%3c/svg%3e";

    let avatar = rawMessage.senderInfo?.faceUrl || defaultAvatar;

    // For follow_treasury, use the article cover image as avatar (shows content of the collection)
    if (type === NotificationType.FOLLOW_TREASURY && contentData.parsedData?.articleCoverUrl) {
      avatar = contentData.parsedData.articleCoverUrl;
      console.log('[createNotification] FOLLOW_TREASURY using article cover as avatar:', avatar);
    }

    return {
      id: rawMessage.id.toString(),
      type,
      title: formattedMessage.title,
      message: formattedMessage.message,
      avatar,
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