import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '../services/authService';
import { useArticleState } from '../hooks/useArticleState';

interface User {
  id: number;
  username: string;
  email: string;
  bio: string;
  coverUrl: string;
  faceUrl: string;
  namespace: string;
  walletAddress: string;
  avatar?: string; // Keep for backwards compatibility
}

// 社交链接类型定义
interface SocialLink {
  id: number;
  userId: number;
  title: string;
  linkUrl: string;
  iconUrl: string;
  sortOrder: number;
}

interface UserContextValue {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (userData: User, token?: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  updateUserNamespace: (namespace: string) => Promise<boolean>;
  getAuthHeaders: () => Record<string, string>;
  fetchUserInfo: (authToken?: string) => Promise<void>;

  // 社交链接管理
  socialLinks: SocialLink[];
  socialLinksLoading: boolean;
  fetchSocialLinks: () => Promise<void>;
  addSocialLink: (linkData: Omit<SocialLink, 'id' | 'userId'>) => Promise<boolean>;
  updateSocialLink: (id: number, linkData: Partial<SocialLink>) => Promise<boolean>;
  deleteSocialLink: (id: number) => Promise<boolean>;

  // 文章状态管理
  articleLikeStates: Record<string, { isLiked: boolean; likeCount: number }>;
  updateArticleLikeState: (articleId: string, isLiked: boolean, likeCount: number) => void;
  getArticleLikeState: (articleId: string, defaultIsLiked: boolean, defaultLikeCount: number) => { isLiked: boolean; likeCount: number };
  toggleLike: (articleId: string, currentIsLiked: boolean, currentLikeCount: number, onOptimisticUpdate?: (isLiked: boolean, likeCount: number) => void) => Promise<{ success: boolean; isLiked: boolean; likeCount: number }>;
  syncArticleStates: (articles: Array<{ id: string; uuid?: string; isLiked: boolean; likeCount: number; }>) => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // 社交链接状态管理
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [socialLinksLoading, setSocialLinksLoading] = useState(false);

  // 使用文章状态管理hook
  const { articleLikeStates, updateArticleLikeState, getArticleLikeState, toggleLike, syncArticleStates } = useArticleState();

  // 从localStorage恢复用户状态
  useEffect(() => {
    const savedUser = localStorage.getItem('copus_user');
    const savedToken = localStorage.getItem('copus_token');

    if (savedUser && savedToken) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setToken(savedToken);
      } catch (error) {
        console.error('解析用户数据失败:', error);
        localStorage.removeItem('copus_user');
        localStorage.removeItem('copus_token');
      }
    }
  }, []);

  const login = (userData: User, userToken?: string) => {
    setUser(userData);
    localStorage.setItem('copus_user', JSON.stringify(userData));
    if (userToken) {
      setToken(userToken);
      localStorage.setItem('copus_token', userToken);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('copus_user');
    localStorage.removeItem('copus_token');
  };

  // 获取带认证头的请求headers
  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('copus_user', JSON.stringify(updatedUser));
    }
  };

  // 更新用户namespace
  const updateUserNamespace = async (namespace: string): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {

      const success = await AuthService.updateUserNamespace(namespace);

      if (success) {
        // 更新本地用户状态
        const updatedUser = { ...user, namespace };
        setUser(updatedUser);
        localStorage.setItem('copus_user', JSON.stringify(updatedUser));

        return true;
      } else {
        console.error('❌ namespace更新失败');
        return false;
      }
    } catch (error) {
      console.error('❌ 更新namespace时发生错误:', error);
      return false;
    }
  };

  // Token自动刷新功能
  const tryRefreshToken = async (): Promise<boolean> => {
    try {
      // 这里可以调用刷新token的API
      // const refreshResponse = await AuthService.refreshToken();
      // 暂时返回false，表示需要重新登录
      return false;
    } catch (error) {
      console.error('刷新token失败:', error);
      return false;
    }
  };

  // 获取用户详细信息
  const fetchUserInfo = async (authToken?: string, retryOnFailure: boolean = true) => {
    try {
      // 如果传入了token，优先使用；否则从localStorage获取
      const tokenToUse = authToken || localStorage.getItem('copus_token');

      const userInfo = await AuthService.getUserInfo(tokenToUse || undefined);

      setUser(userInfo);
      localStorage.setItem('copus_user', JSON.stringify(userInfo));
    } catch (error) {
      console.error('获取用户信息失败:', error);

      // 如果允许重试且是认证错误，尝试刷新token
      if (retryOnFailure && error instanceof Error && error.message.includes('认证')) {
        const refreshSuccess = await tryRefreshToken();
        if (refreshSuccess) {
          // 刷新成功，重新获取用户信息（不再重试）
          return fetchUserInfo(authToken, false);
        }
      }

      // 如果获取用户信息失败，可能token已过期，执行登出
      logout();
    }
  };

  // 社交链接管理函数
  const fetchSocialLinks = async (): Promise<void> => {
    if (!user) {
      return;
    }

    try {
      setSocialLinksLoading(true);
      const response = await AuthService.getUserSocialLinks();

      // 处理API响应数据
      let linksArray: SocialLink[] = [];
      if (Array.isArray(response)) {
        linksArray = response;
      } else if (response.data && Array.isArray(response.data)) {
        linksArray = response.data;
      }

      setSocialLinks(linksArray);

    } catch (error) {
      console.error('❌ 获取社交链接失败:', error);
      setSocialLinks([]);
    } finally {
      setSocialLinksLoading(false);
    }
  };

  const addSocialLink = async (linkData: Omit<SocialLink, 'id' | 'userId'>): Promise<boolean> => {
    if (!user) return false;

    try {
      const requestData = {
        ...linkData,
        sortOrder: linkData.sortOrder || socialLinks.length
      };

      const response = await AuthService.editSocialLink(requestData);

      // 优化：直接使用响应数据更新本地状态
      if (response && response.linkUrl && response.title) {
        const newLink: SocialLink = {
          id: response.id || Date.now(),
          userId: response.userId || user.id,
          title: response.title,
          linkUrl: response.linkUrl,
          iconUrl: response.iconUrl,
          sortOrder: response.sortOrder || socialLinks.length
        };

        setSocialLinks(prev => [...prev, newLink]);
        return true;
      } else {
        // 如果响应数据不完整，重新获取
        await fetchSocialLinks();
        return true;
      }
    } catch (error) {
      console.error('❌ 添加社交链接失败:', error);
      return false;
    }
  };

  const updateSocialLink = async (id: number, linkData: Partial<SocialLink>): Promise<boolean> => {
    if (!user) return false;

    try {

      // 找到要更新的链接
      const existingLink = socialLinks.find(link => link.id === id);
      if (!existingLink) {
        console.error('❌ 未找到要更新的社交链接');
        return false;
      }

      const requestData = {
        ...existingLink,
        ...linkData
      };

      const response = await AuthService.editSocialLink(requestData);

      // 更新本地状态
      setSocialLinks(prev =>
        prev.map(link =>
          link.id === id ? { ...link, ...linkData } : link
        )
      );

      return true;
    } catch (error) {
      console.error('❌ 更新社交链接失败:', error);
      return false;
    }
  };

  const deleteSocialLink = async (id: number): Promise<boolean> => {
    if (!user) return false;

    try {

      await AuthService.deleteSocialLink(id);

      // 更新本地状态
      setSocialLinks(prev => prev.filter(link => link.id !== id));

      return true;
    } catch (error) {
      console.error('❌ 删除社交链接失败:', error);
      return false;
    }
  };

  // 当用户登录时自动获取社交链接
  useEffect(() => {
    if (user) {
      fetchSocialLinks();
    } else {
      setSocialLinks([]);
    }
  }, [user]);

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        isLoggedIn: !!user,
        login,
        logout,
        updateUser,
        updateUserNamespace,
        getAuthHeaders,
        fetchUserInfo,

        // 社交链接管理
        socialLinks,
        socialLinksLoading,
        fetchSocialLinks,
        addSocialLink,
        updateSocialLink,
        deleteSocialLink,

        // 文章状态管理
        articleLikeStates,
        updateArticleLikeState,
        getArticleLikeState,
        toggleLike,
        syncArticleStates
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};