// Article queries
export {
  useArticlesQuery,
  useInfiniteArticlesQuery,
  useArticles,
} from './useArticlesQuery';

export {
  useArticleDetailQuery,
  useArticleDetail,
} from './useArticleDetailQuery';

export {
  useMyCreatedArticlesQuery,
  useMyCreatedArticles,
} from './useMyCreatedArticlesQuery';

// Category queries
export {
  useCategoriesQuery,
  useCategories,
} from './useCategoriesQuery';

// Notification queries
export {
  useNotificationsQuery,
  useUnreadNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
  useClearAllNotificationsMutation,
} from './useNotificationsQuery';

// Optimized queries and cache management
export {
  usePublishArticleMutation,
  usePrefetchArticleDetail,
  useBatchPrefetchArticles,
  useUserProfileWithLinks,
  useCacheManager,
} from './useOptimizedQueries';