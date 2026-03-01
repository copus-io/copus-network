/**
 * 测试工具：订阅消息类型10验证
 * Test utility for subscribe notification type 10 validation
 */

import { NotificationMessageFactory, RawApiMessage } from '../services/notification/NotificationMessageFactory';

/**
 * 创建测试用的订阅消息
 * Create test subscribe notification
 */
export const createTestSubscribeNotification = (senderUsername: string = 'TestUser'): RawApiMessage => {
  return {
    id: Date.now(),
    messageType: 10, // 新的订阅消息类型
    content: `${senderUsername} subscribed to you!`,
    createdAt: Math.floor(Date.now() / 1000), // timestamp in seconds
    isRead: false,
    senderInfo: {
      id: 123,
      username: senderUsername,
      namespace: senderUsername.toLowerCase(),
      faceUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${senderUsername}`
    }
  };
};

/**
 * 测试订阅消息处理功能
 * Test subscribe notification processing
 */
export const testSubscribeNotificationProcessing = () => {
  console.log('🧪 Testing subscribe notification type 10...');

  // 创建测试数据
  const rawMessage = createTestSubscribeNotification('JohnDoe');

  console.log('📝 Raw API message:', rawMessage);

  // 处理消息
  const processedNotification = NotificationMessageFactory.createNotification(rawMessage);

  console.log('✨ Processed notification:', processedNotification);

  // 验证处理结果
  const expected = {
    type: 'subscribe',
    title: '新订阅',
    message: '[JohnDoe] subscribed to you!',
    actionUrl: '/user/johndoe'
  };

  const isValid =
    processedNotification.type === expected.type &&
    processedNotification.title === expected.title &&
    processedNotification.message === expected.message &&
    processedNotification.actionUrl === expected.actionUrl;

  console.log('✅ Test result:', {
    isValid,
    expected,
    actual: {
      type: processedNotification.type,
      title: processedNotification.title,
      message: processedNotification.message,
      actionUrl: processedNotification.actionUrl
    }
  });

  return isValid;
};

/**
 * 在浏览器控制台中运行测试
 * Run test in browser console
 */
if (typeof window !== 'undefined') {
  // 添加到全局对象，方便在控制台调用
  (window as any).testSubscribeNotification = testSubscribeNotificationProcessing;
  console.log('🎯 Test function available: window.testSubscribeNotification()');
}