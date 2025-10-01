import { apiRequest } from './api';

// 分类接口类型定义
export interface Category {
  id: number;
  name: string;
  color: string;
  articleCount: number;
}

export interface CategoryListResponse {
  status: number;
  msg: string;
  data: {
    data: Category[];
  };
}

// 获取分类列表
export const getCategoryList = async (): Promise<Category[]> => {
  console.log('🔍 Fetching category list...');

  const response = await apiRequest<CategoryListResponse>(
    '/client/author/article/categoryList',
    { requiresAuth: true }
  );

  if (response.status !== 1) {
    throw new Error(response.msg || 'Failed to fetch categories');
  }

  console.log('✅ Categories fetched successfully:', response.data.data);
  return response.data.data;
};