import { QueryClient } from '@tanstack/react-query';

// Create QueryClient instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global default configuration
      staleTime: 5 * 60 * 1000, // Data is considered fresh within 5 minutes
      cacheTime: 30 * 60 * 1000, // Clear cache after 30 minutes
      retry: 2, // Retry 2 times on failure
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: true, // Refetch on network reconnect
    },
    mutations: {
      retry: 1, // Retry 1 time on mutation failure
    },
  },
});

// Query key factory - unified query key management
export const queryKeys = {
  // Article related
  articles: ['articles'] as const,
  articlesList: (params?: any) => [...queryKeys.articles, 'list', params] as const,
  articlesInfinite: (params?: any) => [...queryKeys.articles, 'infinite', params] as const,

  // Category related
  categories: ['categories'] as const,
  categoriesList: () => [...queryKeys.categories, 'list'] as const,

  // User related
  user: ['user'] as const,
  userProfile: (userId?: string) => [...queryKeys.user, 'profile', userId] as const,
  userArticles: (userId: string) => [...queryKeys.user, userId, 'articles'] as const,

  // Notification related
  notifications: ['notifications'] as const,
  notificationsList: () => [...queryKeys.notifications, 'list'] as const,
  notificationsUnread: () => [...queryKeys.notifications, 'unread'] as const,

  // Social links
  socialLinks: ['socialLinks'] as const,
  socialLinksList: (userId?: string) => [...queryKeys.socialLinks, 'list', userId] as const,

  // Treasured/liked articles
  treasures: ['treasures'] as const,
  treasuresList: (userId?: string) => [...queryKeys.treasures, 'list', userId] as const,
} as const;

// Cache strategy configuration
export const cacheConfig = {
  // Static data - long-term caching
  static: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  },

  // User data - medium-term caching
  user: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: true,
  },

  // Content data - short-term caching
  content: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
  },

  // Real-time data - minimal caching
  realtime: {
    staleTime: 0, // Expires immediately
    cacheTime: 5 * 60 * 1000, // Clear after 5 minutes
    refetchInterval: 30000, // 30 second polling
  },

  // Sensitive data - no caching
  sensitive: {
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: 'always',
  },
} as const;