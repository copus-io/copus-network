# 分类接口类型定义使用示例

## API 接口
```bash
curl --location --request GET 'https://api-test.copus.network/client/author/article/categoryList' \
--header 'Authorization: Bearer YOUR_TOKEN'
```

## 类型定义
```typescript
import { ArticleCategoryItem, ArticleCategoryListResponse } from '../types/category';

// 分类项目接口
interface ArticleCategoryItem {
  id: number;              // 分类ID
  name: string;            // 分类名称
  color: string;           // 分类颜色
  articleCount: number;    // 文章数量
}

// API响应接口
interface ArticleCategoryListResponse {
  data: ArticleCategoryItem[];  // 分类数据数组
  status?: number;              // API状态码
  msg?: string;                 // API响应消息
}
```

## 使用示例

### 在服务中使用
```typescript
import { AuthService } from '../services/authService';
import { ArticleCategoryListResponse } from '../types/category';

const response: ArticleCategoryListResponse = await AuthService.getCategoryList();
console.log('分类列表:', response.data);
```

### 在组件中使用
```typescript
import { useCategory } from '../contexts/CategoryContext';
import { ArticleCategoryItem } from '../types/category';

function CategoryComponent() {
  const { categories, getCategoryById } = useCategory();

  const category: ArticleCategoryItem | undefined = getCategoryById(1);

  return (
    <div>
      {categories.map(category => (
        <div key={category.id} style={{ color: category.color }}>
          {category.name} ({category.articleCount})
        </div>
      ))}
    </div>
  );
}
```

## 优化要点

1. **类型安全**: 使用 TypeScript 接口确保类型安全
2. **命名规范**: 使用清晰的命名约定 (ArticleCategoryItem)
3. **扩展性**: 支持 `[property: string]: any` 允许未来扩展
4. **向后兼容**: 提供别名类型保持兼容性
5. **完整文档**: 包含详细的 JSDoc 注释