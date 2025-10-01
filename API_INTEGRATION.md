# API 集成说明

## Discovery 页面已更新

Discovery 页面现在已经集成了后端 API `/client/home/pageArticle`。

### 集成的功能

1. **API 服务层** (`src/services/`)
   - `api.ts` - 通用 API 请求配置
   - `articleService.ts` - 文章相关 API 服务

2. **数据类型定义** (`src/types/article.ts`)
   - `Article` - 文章数据类型
   - `PageArticleResponse` - API 响应类型
   - `PageArticleParams` - 请求参数类型

3. **React Hook** (`src/hooks/useArticles.ts`)
   - 管理文章数据获取、加载状态、错误处理
   - 支持分页和刷新功能

4. **UI 状态**
   - 加载状态显示
   - 错误处理和重试
   - 空数据状态

### 后端 API 要求

后端 `/client/home/pageArticle` 接口需要返回以下格式的数据：

```json
{
  "articles": [
    {
      "id": "string|number",
      "title": "string",
      "description": "string",
      "category": "string",
      "coverImage": "string (URL)",
      "userName": "string",
      "userAvatar": "string (URL)",
      "date": "string (ISO date)",
      "treasureCount": "number",
      "visitCount": "number",
      "website": "string"
    }
  ],
  "total": "number",
  "page": "number",
  "pageSize": "number",
  "hasMore": "boolean"
}
```

### 环境配置

1. 复制 `.env.example` 为 `.env`
2. 设置 `REACT_APP_API_BASE_URL` 为你的后端 API 地址

### 支持的查询参数

- `page` - 页码
- `pageSize` - 每页数量
- `category` - 分类筛选
- `search` - 搜索关键词

### 分类支持

目前支持以下分类及其对应的颜色样式：
- Art (绿色)
- Sports (蓝色)
- Technology (黄色)
- Life (粉色)

可以在 `src/utils/categoryStyles.ts` 中添加更多分类样式。