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

  // User data loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red"></div>
      </div>
    );
  }

  // Requires login but user is not logged in
  if (requireAuth && !user) {
    if (showUnauthorized) {
      return <UnauthorizedPage />;
    }

    // Save current page path, can redirect back after login
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Logged-in user accessing login page, redirect to homepage
  if (!requireAuth && user && (location.pathname === '/login' || location.pathname === '/signup')) {
    return <Navigate to="/copus" replace />;
  }

  return <>{children}</>;
};