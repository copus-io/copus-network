// React hook for user information with TanStack Query integration

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthService } from '../../services/authService';
import { UserInfo, GetUserInfoOptions } from '../../types/user';

/**
 * Hook to fetch user information with caching
 */
export const useUserInfo = (options: GetUserInfoOptions = {}) => {
  const queryClient = useQueryClient();

  return useQuery<UserInfo, Error>({
    queryKey: ['userInfo', options.token || 'default'],
    queryFn: () => AuthService.getUserInfo(options),
    staleTime: 5 * 60 * 1000, // 5 minutes - matches AuthService cache
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: true
  });
};

/**
 * Hook to preload user information
 */
export const usePreloadUserInfo = () => {
  const queryClient = useQueryClient();

  const preloadUserInfo = (token?: string) => {
    queryClient.prefetchQuery({
      queryKey: ['userInfo', token || 'default'],
      queryFn: () => AuthService.getUserInfo({ token }),
      staleTime: 5 * 60 * 1000
    });
  };

  return { preloadUserInfo };
};

/**
 * Hook to invalidate user info cache
 */
export const useUserInfoActions = () => {
  const queryClient = useQueryClient();

  const refreshUserInfo = (token?: string) => {
    const queryKey = ['userInfo', token || 'default'];
    // Clear React Query cache
    queryClient.invalidateQueries({ queryKey });
    // Clear AuthService cache
    AuthService.clearUserInfoCache(token);
  };

  const clearUserInfoCache = () => {
    // Clear all user info queries
    queryClient.removeQueries({ queryKey: ['userInfo'] });
    // Clear AuthService cache
    AuthService.clearUserInfoCache();
  };

  return {
    refreshUserInfo,
    clearUserInfoCache
  };
};