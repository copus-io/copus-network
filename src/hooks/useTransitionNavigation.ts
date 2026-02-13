/**
 * Hook to handle navigation with startTransition to prevent Suspense errors
 */
import { useCallback, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';

export const useTransitionNavigation = () => {
  const navigate = useNavigate();

  const navigateWithTransition = useCallback((path: string, options?: { replace?: boolean }) => {
    startTransition(() => {
      navigate(path, options);
    });
  }, [navigate]);

  return navigateWithTransition;
};