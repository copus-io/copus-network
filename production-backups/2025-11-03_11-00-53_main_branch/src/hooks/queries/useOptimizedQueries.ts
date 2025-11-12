import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publishArticle } from '../../services/articleService';
import { queryKeys, cacheConfig } from '../../lib/queryClient';

// 文章发布 mutation 带有缓存优化
export const usePublishArticleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publishArticle,
    onSuccess: (data) => {
      // 发布成功后，使相关查询失效并重新获取
      queryClient.invalidateQueries({ queryKey: queryKeys.articles });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.user, 'createdArticles'] });

      // 预填充新文章的详情查询
      queryClient.setQueryData(['article', 'detail', data.uuid], data);
    },
    onError: (error) => {
      console.error('发布文章失败:', error);
    },
  });
};

// 预加载文章详情的优化hook
export const usePrefetchArticleDetail = () => {
  const queryClient = useQueryClient();

  return (uuid: string) => {
    queryClient.prefetchQuery({
      queryKey: ['article', 'detail', uuid],
      queryFn: async () => {
        const { getArticleDetail } = await import('../../services/articleService');
        return getArticleDetail(uuid);
      },
      staleTime: 10 * 60 * 1000, // 10分钟
    });
  };
};

// 批量预加载文章详情
export const useBatchPrefetchArticles = () => {
  const queryClient = useQueryClient();

  return (articleIds: string[]) => {
    articleIds.forEach((uuid) => {
      queryClient.prefetchQuery({
        queryKey: ['article', 'detail', uuid],
        queryFn: async () => {
          const { getArticleDetail } = await import('../../services/articleService');
          return getArticleDetail(uuid);
        },
        staleTime: 10 * 60 * 1000, // 10分钟
      });
    });
  };
};

// 优化的用户数据查询，结合社交链接
export const useUserProfileWithLinks = (userId?: string) => {
  return useQuery({
    queryKey: queryKeys.userProfile(userId),
    queryFn: async () => {
      // 这里可以组合多个API调用
      const [userProfile, socialLinks] = await Promise.all([
        // 假设有获取用户资料的API
        Promise.resolve(null), // 占位符
        // 获取社交链接
        Promise.resolve([]), // 占位符
      ]);

      return {
        profile: userProfile,
        socialLinks: socialLinks,
      };
    },
    enabled: !!userId,
    ...cacheConfig.user,
  });
};

// 缓存清理工具
export const useCacheManager = () => {
  const queryClient = useQueryClient();

  return {
    // 清除所有过期缓存
    clearStaleCache: () => {
      queryClient.getQueryCache().getAll().forEach((query) => {
        if (query.isStale()) {
          queryClient.removeQueries({ queryKey: query.queryKey });
        }
      });
    },

    // 预热核心数据
    warmupCache: () => {
      // 预加载分类列表
      queryClient.prefetchQuery({
        queryKey: queryKeys.categoriesList(),
        queryFn: async () => {
          const { getCategoryList } = await import('../../services/categoryService');
          return getCategoryList();
        },
        staleTime: 30 * 60 * 1000,
      });
    },

    // 强制刷新所有查询
    refreshAll: () => {
      queryClient.invalidateQueries();
    },

    // 清除用户相关缓存（用于登出）
    clearUserCache: () => {
      queryClient.removeQueries({ queryKey: queryKeys.user });
      queryClient.removeQueries({ queryKey: queryKeys.notifications });
    },
  };
};