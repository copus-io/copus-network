import { useState, useEffect, useCallback } from 'react';
import { getCategoryList, Category } from '../services/categoryService';

interface UseCategoriesState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

export const useCategories = () => {
  const [state, setState] = useState<UseCategoriesState>({
    categories: [],
    loading: false,
    error: null,
  });

  const fetchCategories = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const categories = await getCategoryList();
      setState(prev => ({
        ...prev,
        categories,
        loading: false,
      }));
    } catch (error) {
      let errorMessage = 'Failed to fetch categories';

      if (error instanceof Error) {
        if (error.message.includes('系统内部错误')) {
          errorMessage = '后端服务暂时不可用，请联系技术团队检查服务状态';
        } else {
          errorMessage = error.message;
        }
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, []);

  const refresh = useCallback(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    ...state,
    refresh,
  };
};