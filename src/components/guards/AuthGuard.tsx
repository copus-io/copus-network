import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallbackPath?: string;
  showUnauthorized?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  fallbackPath = '/login',
  showUnauthorized = false,
}) => {
  const { user, loading } = useUser();
  const location = useLocation();

  // 用户数据加载中
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red"></div>
      </div>
    );
  }

  // 需要登录但用户未登录
  if (requireAuth && !user) {
    if (showUnauthorized) {
      return <UnauthorizedPage />;
    }

    // 保存当前页面路径，登录后可以重定向回来
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // 已登录用户访问登录页面，重定向到首页
  if (!requireAuth && user && (location.pathname === '/login' || location.pathname === '/signup')) {
    return <Navigate to="/discovery" replace />;
  }

  return <>{children}</>;
};