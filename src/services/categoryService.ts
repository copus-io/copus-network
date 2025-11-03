import { apiRequest } from './api';

// Category interface type definitions
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

// Get category list
export const getCategoryList = async (): Promise<Category[]> => {

  const response = await apiRequest<CategoryListResponse>(
    '/client/author/article/categoryList'
    // Categories are publicly accessible but will use token if available
  );

  if (response.status !== 1) {
    throw new Error(response.msg || 'Failed to fetch categories');
  }

  return response.data.data;
};