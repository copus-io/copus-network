import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '../services/authService';
import { ArticleCategoryItem, CategoryContextValue } from '../types/category';

const CategoryContext = createContext<CategoryContextValue | undefined>(undefined);

// 默认分类数据（作为备用） - 与服务器返回格式一致
const defaultCategories: ArticleCategoryItem[] = [
  {
    id: 1,
    name: "科技",
    color: "red", // 使用颜色名称，与服务器返回格式一致
    articleCount: 0,
  },
  {
    id: 2,
    name: "艺术",
    color: "green", // 使用颜色名称，与服务器返回格式一致
    articleCount: 0,
  },
];

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<ArticleCategoryItem[]>(defaultCategories);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // 获取分类列表
  const fetchCategories = async (): Promise<void> => {
    setCategoriesLoading(true);
    try {
      console.log('🎯 开始获取分类列表...');
      const response = await AuthService.getCategoryList();
      console.log('📋 分类API原始响应:', response);
      console.log('📋 分类API响应JSON:', JSON.stringify(response, null, 2));

      // 处理双重嵌套的数据结构
      let categoryList: ArticleCategoryItem[] = [];
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // 双重嵌套：{data: {data: [...]}}
        categoryList = response.data.data;
        console.log('✅ 解析双重嵌套数据结构');
      } else if (response.data && Array.isArray(response.data)) {
        // 单层嵌套：{data: [...]}
        categoryList = response.data;
        console.log('✅ 解析单层嵌套数据结构');
      } else if (Array.isArray(response)) {
        // 直接数组：[...]
        categoryList = response;
        console.log('✅ 解析直接数组结构');
      }

      console.log('🎨 最终分类列表:', categoryList);
      console.log('🎨 分类详细信息:');
      categoryList.forEach((cat, index) => {
        console.log(`  [${index}] ID:${cat.id}, 名称:${cat.name}, 颜色:${cat.color}, 文章数:${cat.articleCount}`);
        console.log(`       原始对象:`, cat);
      });

      if (categoryList && categoryList.length > 0) {
        setCategories(categoryList);
      } else {
        console.warn('⚠️ 分类列表为空，使用默认分类');
        setCategories(defaultCategories);
      }
    } catch (error) {
      console.error('❌ 获取分类列表失败:', error);
      setCategories(defaultCategories);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // 根据ID查找分类
  const getCategoryById = (id: number): ArticleCategoryItem | undefined => {
    return categories.find(category => category.id === id);
  };

  // 根据名称查找分类
  const getCategoryByName = (name: string): ArticleCategoryItem | undefined => {
    return categories.find(category => category.name === name);
  };

  // 初始化时加载分类
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