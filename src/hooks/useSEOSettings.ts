import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { setSEOSettings } from '../services/articleService';
import { SEOSettings } from '../types/article';
import { useToast } from '../components/ui/toast';

interface UseSEOSettingsOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useSEOSettings = (options?: UseSEOSettingsOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const mutation = useMutation({
    mutationFn: (seoData: SEOSettings) => setSEOSettings(seoData),
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: () => {
      setIsLoading(false);
      showToast('SEO设置已更新', 'success');
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      setIsLoading(false);
      console.error('SEO设置失败:', error);
      showToast(`SEO设置失败: ${error.message}`, 'error');
      options?.onError?.(error);
    },
  });

  const updateSEO = async (seoData: SEOSettings) => {
    try {
      await mutation.mutateAsync(seoData);
    } catch (error) {
      // Error is already handled in onError
      throw error;
    }
  };

  return {
    updateSEO,
    isLoading: isLoading || mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
};