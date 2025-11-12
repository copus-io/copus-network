/**
 * Article category related type definitions
 * API endpoint: GET /client/author/article/categoryList
 */

/**
 * Category item interface
 */
export interface ArticleCategoryItem {
  /** Category ID */
  id: number;
  /** Category name */
  name: string;
  /** Category color (hexadecimal color code) */
  color: string;
  /** Number of articles in this category */
  articleCount: number;
  /** Extended properties, allow adding other possible fields */
  [property: string]: any;
}

/**
 * Article category list API response interface
 */
export interface ArticleCategoryListResponse {
  /** Category data array */
  data: ArticleCategoryItem[];
  /** API status code */
  status?: number;
  /** API response message */
  msg?: string;
  /** Extended properties, allow adding other response fields */
  [property: string]: any;
}

/**
 * Category context value type (for React Context)
 */
export interface CategoryContextValue {
  /** Category list */
  categories: ArticleCategoryItem[];
  /** Loading state */
  categoriesLoading: boolean;
  /** Fetch categories method */
  fetchCategories: () => Promise<void>;
  /** Find category by ID */
  getCategoryById: (id: number) => ArticleCategoryItem | undefined;
  /** Find category by name */
  getCategoryByName: (name: string) => ArticleCategoryItem | undefined;
}

/**
 * Compatibility alias - maintain backward compatibility
 * @deprecated Please use ArticleCategoryItem
 */
export type Category = ArticleCategoryItem;

/**
 * API response alias - more concise naming
 * @deprecated Please use ArticleCategoryListResponse
 */
export type Response = ArticleCategoryListResponse;