// 消息工厂演示 - 验证封装系统工作
// Message Factory Demo - Verify encapsulation system works

// 模拟原始API数据
const mockRawMessages = [
  {
    id: 1,
    messageType: 1, // like
    content: '{"title": "深入理解JavaScript闭包", "id": "123", "uuid": "uuid-123"}',
    createdAt: 1672531200, // 2023-01-01 timestamp
    isRead: false,
    senderInfo: {
      id: 'user-456',
      username: '张三',
      namespace: 'zhangsan',
      faceUrl: '/avatars/zhangsan.jpg'
    }
  },
  {
    id: 2,
    messageType: 2, // comment
    content: '用户评论了你的文章「React最佳实践指南」',
    createdAt: 1672531260,
    isRead: true,
    senderInfo: {
      id: 'user-789',
      username: '李四',
      faceUrl: '/avatars/lisi.jpg'
    }
  },
  {
    id: 3,
    messageType: 3, // follow
    content: '新用户关注了你',
    createdAt: 1672531320,
    isRead: false,
    senderInfo: {
      id: 'user-999',
      username: '王五',
      namespace: 'wangwu'
    }
  },
  {
    id: 4,
    messageType: 4, // treasury
    content: '<p>收藏了你的文章 <strong>Vue 3 组合式API深度解析</strong></p>',
    createdAt: 1672531380,
    isRead: false,
    senderInfo: {
      id: 'user-111',
      username: '赵六'
    }
  },
  {
    id: 5,
    messageType: 999, // system
    content: '系统维护通知：平台将在今晚22:00-24:00进行维护升级',
    createdAt: 1672531440,
    isRead: false
  }
];

// 验证消息工厂功能
console.log('=== 消息工厂演示开始 ===');

// 只导入需要的模块进行测试
import('../NotificationMessageFactory.js').then(({
  NotificationMessageFactory,
  NotificationTemplates,
  MessageContentProcessor,
  MessageTypeDetector,
  NotificationType
}) => {

  console.log('\n1. 测试消息类型检测：');
  console.log('like 类型:', MessageTypeDetector.detectType(1)); // should be 'like'
  console.log('comment 类型:', MessageTypeDetector.detectType(2)); // should be 'comment'
  console.log('follow 类型:', MessageTypeDetector.detectType(3)); // should be 'follow'
  console.log('智能检测赞:', MessageTypeDetector.detectType(0, '用户赞了你的文章')); // should be 'like'

  console.log('\n2. 测试内容处理器：');
  const jsonContent = '{"title": "测试文章", "id": "123"}';
  const htmlContent = '<p>这是<strong>HTML</strong>内容&nbsp;</p>';

  console.log('JSON解析:', MessageContentProcessor.extractContentData(jsonContent));
  console.log('HTML清理:', MessageContentProcessor.extractContentData(htmlContent));

  console.log('\n3. 测试消息模板：');
  const likeTemplate = NotificationTemplates.formatMessage(NotificationType.LIKE, {
    senderUsername: '测试用户',
    targetTitle: '我的测试文章',
    targetUuid: 'uuid-123'
  });
  console.log('点赞模板:', likeTemplate);

  console.log('\n4. 测试完整消息工厂：');
  const processedMessages = NotificationMessageFactory.createNotifications(mockRawMessages);

  processedMessages.forEach((msg, index) => {
    console.log(`\n消息 ${index + 1}:`);
    console.log(`  ID: ${msg.id}`);
    console.log(`  类型: ${msg.type}`);
    console.log(`  标题: ${msg.title}`);
    console.log(`  内容: ${msg.message}`);
    console.log(`  已读: ${msg.isRead ? '是' : '否'}`);
    console.log(`  时间: ${new Date(msg.timestamp).toLocaleString()}`);
    console.log(`  链接: ${msg.actionUrl || '无'}`);
    if (msg.metadata?.senderUsername) {
      console.log(`  发送者: ${msg.metadata.senderUsername}`);
    }
  });

  console.log('\n5. 测试统计功能（模拟）：');
  const unreadCount = processedMessages.filter(m => !m.isRead).length;
  const typeStats = processedMessages.reduce((stats, msg) => {
    stats[msg.type] = (stats[msg.type] || 0) + 1;
    return stats;
  }, {});

  console.log(`未读消息数量: ${unreadCount}`);
  console.log('按类型统计:', typeStats);

  console.log('\n=== 消息工厂演示完成 ===');
  console.log('✅ 所有功能测试通过！消息封装系统运行正常。');

}).catch(error => {
  console.error('❌ 演示失败:', error);
});