/**
 * 文章分类相关类型定义
 * API端点: GET /client/author/article/categoryList
 */

/**
 * 分类项目接口
 */
export interface ArticleCategoryItem {
  /** 分类ID */
  id: number;
  /** 分类名称 */
  name: string;
  /** 分类颜色 (十六进制颜色代码) */
  color: string;
  /** 该分类下的文章数量 */
  articleCount: number;
  /** 扩展属性，允许添加其他可能的字段 */
  [property: string]: any;
}

/**
 * 文章分类列表API响应接口
 */
export interface ArticleCategoryListResponse {
  /** 分类数据数组 */
  data: ArticleCategoryItem[];
  /** API状态码 */
  status?: number;
  /** API响应消息 */
  msg?: string;
  /** 扩展属性，允许添加其他响应字段 */
  [property: string]: any;
}

/**
 * 分类上下文值类型（用于React Context）
 */
export interface CategoryContextValue {
  /** 分类列表 */
  categories: ArticleCategoryItem[];
  /** 加载状态 */
  categoriesLoading: boolean;
  /** 获取分类列表方法 */
  fetchCategories: () => Promise<void>;
  /** 根据ID查找分类 */
  getCategoryById: (id: number) => ArticleCategoryItem | undefined;
  /** 根据名称查找分类 */
  getCategoryByName: (name: string) => ArticleCategoryItem | undefined;
}

/**
 * 兼容性别名 - 保持向后兼容
 * @deprecated 请使用 ArticleCategoryItem
 */
export type Category = ArticleCategoryItem;

/**
 * API响应别名 - 更简洁的命名
 * @deprecated 请使用 ArticleCategoryListResponse
 */
export type Response = ArticleCategoryListResponse;