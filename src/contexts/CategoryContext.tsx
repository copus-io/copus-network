import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '../services/authService';
import { ArticleCategoryItem, CategoryContextValue } from '../types/category';

const CategoryContext = createContext<CategoryContextValue | undefined>(undefined);

// Default category data (as fallback) - consistent with server response format
const defaultCategories: ArticleCategoryItem[] = [
  {
    id: 1,
    name: "科技",
    color: "red", // Use color names, consistent with server response format
    articleCount: 0,
  },
  {
    id: 2,
    name: "艺术",
    color: "green", // Use color names, consistent with server response format
    articleCount: 0,
  },
];

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<ArticleCategoryItem[]>(defaultCategories);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Fetch category list
  const fetchCategories = async (): Promise<void> => {
    setCategoriesLoading(true);
    try {
      const response = await AuthService.getCategoryList();

      // Handle double-nested data structure
      let categoryList: ArticleCategoryItem[] = [];
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // Double nested: {data: {data: [...]}}
        categoryList = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        // Single layer nested: {data: [...]}
        categoryList = response.data;
      } else if (Array.isArray(response)) {
        // Direct array: [...]
        categoryList = response;
      }

      categoryList.forEach((cat, index) => {
      });

      if (categoryList && categoryList.length > 0) {
        setCategories(categoryList);
      } else {
        setCategories(defaultCategories);
      }
    } catch (error) {
      console.error('Failed to fetch category list:', error);
      setCategories(defaultCategories);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Find category by ID
  const getCategoryById = (id: number): ArticleCategoryItem | undefined => {
    return categories.find(category => category.id === id);
  };

  // Find category by name
  const getCategoryByName = (name: string): ArticleCategoryItem | undefined => {
    return categories.find(category => category.name === name);
  };

  // Load categories on initialization
  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        categoriesLoading,
        fetchCategories,
        getCategoryById,
        getCategoryByName,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategory must be used within CategoryProvider');
  }
  return context;
};