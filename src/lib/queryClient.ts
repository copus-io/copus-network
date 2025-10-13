import { QueryClient } from '@tanstack/react-query';

// 创建 QueryClient 实例
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 全局默认配置
      staleTime: 5 * 60 * 1000, // 5分钟内数据被认为是新鲜的
      cacheTime: 30 * 60 * 1000, // 30分钟后清除缓存
      retry: 2, // 失败时重试2次
      refetchOnWindowFocus: false, // 窗口聚焦时不重新获取
      refetchOnReconnect: true, // 网络重连时重新获取
    },
    mutations: {
      retry: 1, // mutation 失败时重试1次
    },
  },
});

// 查询键工厂 - 统一管理查询键
export const queryKeys = {
  // 文章相关
  articles: ['articles'] as const,
  articlesList: (params?: any) => [...queryKeys.articles, 'list', params] as const,
  articlesInfinite: (params?: any) => [...queryKeys.articles, 'infinite', params] as const,

  // 分类相关
  categories: ['categories'] as const,
  categoriesList: () => [...queryKeys.categories, 'list'] as const,

  // 用户相关
  user: ['user'] as const,
  userProfile: (userId?: string) => [...queryKeys.user, 'profile', userId] as const,
  userArticles: (userId: string) => [...queryKeys.user, userId, 'articles'] as const,

  // 通知相关
  notifications: ['notifications'] as const,
  notificationsList: () => [...queryKeys.notifications, 'list'] as const,
  notificationsUnread: () => [...queryKeys.notifications, 'unread'] as const,

  // 社交链接
  socialLinks: ['socialLinks'] as const,
  socialLinksList: (userId?: string) => [...queryKeys.socialLinks, 'list', userId] as const,

  // 宝藏/点赞文章
  treasures: ['treasures'] as const,
  treasuresList: (userId?: string) => [...queryKeys.treasures, 'list', userId] as const,
} as const;

// 缓存策略配置
export const cacheConfig = {
  // 静态数据 - 长时间缓存
  static: {
    staleTime: 30 * 60 * 1000, // 30分钟
    cacheTime: 60 * 60 * 1000, // 1小时
  },

  // 用户数据 - 中等缓存
  user: {
    staleTime: 10 * 60 * 1000, // 10分钟
    cacheTime: 30 * 60 * 1000, // 30分钟
    refetchOnWindowFocus: true,
  },

  // 内容数据 - 较短缓存
  content: {
    staleTime: 5 * 60 * 1000, // 5分钟
    cacheTime: 15 * 60 * 1000, // 15分钟
  },

  // 实时数据 - 最小缓存
  realtime: {
    staleTime: 0, // 立即过期
    cacheTime: 5 * 60 * 1000, // 5分钟后清除
    refetchInterval: 30000, // 30秒轮询
  },

  // 敏感数据 - 不缓存
  sensitive: {
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: 'always',
  },
} as const;