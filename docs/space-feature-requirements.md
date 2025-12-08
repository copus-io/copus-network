# Copus 空间功能技术需求与原型对比

## 📋 项目概述

Copus 空间功能是对现有内容策展平台的重要扩展，允许用户创建主题空间来组织和分享相关内容。本文档详细对比了原型实现与完整技术需求。

## 🎯 核心概念

**空间 (Space)**: 用户创建的主题内容集合，类似于策展集合，其他用户可以关注并获取相关内容更新。

## 📊 功能需求对比表格

| 功能模块 | 子功能 | 原型状态 | 技术需求 | 完成度 | 备注 |
|---------|--------|----------|----------|--------|------|
| **空间发现** | 空间列表展示 | ✅ 已实现 | 需要API接口 | 80% | UI完成，需后端 |
| | 分类筛选 | ✅ 已实现 | 需要分类API | 70% | 前端逻辑完成 |
| | 排序功能 | ✅ 已实现 | 需要排序算法 | 60% | 前端UI完成 |
| | 搜索功能 | ✅ 已实现 | 需要搜索API | 50% | 仅UI，无后端 |
| | 分页加载 | ❌ 未实现 | 需要分页逻辑 | 0% | 待开发 |
| **空间详情** | 基本信息展示 | ✅ 已实现 | 需要详情API | 70% | 静态展示 |
| | 文章列表 | ✅ 已实现 | 需要内容API | 60% | 基础UI完成 |
| | 分组管理 | ✅ 已实现 | 需要分组API | 40% | UI原型完成 |
| | 权限控制 | ❌ 未实现 | 需要权限系统 | 0% | 待设计 |
| **关注功能** | 关注/取消关注 | ✅ 已实现 | 需要关注API | 80% | 前端交互完成 |
| | 关注列表 | ✅ 已实现 | 需要关注API | 70% | 基础展示 |
| | 关注数统计 | ✅ 已实现 | 需要统计API | 60% | 静态数据 |
| | 关注通知 | ❌ 未实现 | 需要通知系统 | 0% | 待开发 |
| **空间创建** | 基本信息设置 | ✅ 已实现 | 需要创建API | 80% | 表单完成 |
| | 分步创建流程 | ✅ 已实现 | 前端逻辑完成 | 90% | 体验良好 |
| | 标签管理 | ✅ 已实现 | 需要标签API | 70% | 前端完成 |
| | 自定义分组 | ✅ 已实现 | 需要分组API | 60% | 基础功能 |
| | 权限设置 | ❌ 未实现 | 需要权限API | 0% | 待设计 |
| **我的空间** | 空间管理 | ✅ 已实现 | 需要管理API | 70% | 基础管理 |
| | 编辑功能 | ✅ 已实现 | 需要编辑API | 50% | 仅UI提示 |
| | 删除功能 | ✅ 已实现 | 需要删除API | 50% | 仅UI提示 |
| | 统计信息 | ✅ 已实现 | 需要统计API | 60% | 静态展示 |
| **内容添加** | 添加到空间 | ✅ 已实现 | 需要添加API | 80% | 模态框完成 |
| | 选择目标空间 | ✅ 已实现 | 需要空间API | 70% | 基础选择 |
| | 批量操作 | ❌ 未实现 | 需要批量API | 0% | 待开发 |

## 🏗 技术架构需求

### 前端架构

```typescript
// 空间数据类型定义
interface Space {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  author: {
    id: number;
    username: string;
    avatar: string;
    namespace: string;
  };
  category: string;
  tags: string[];
  isPublic: boolean;
  articleCount: number;
  followerCount: number;
  createDate: string;
  updateDate: string;
  sections?: SpaceSection[];
}

interface SpaceSection {
  id: string;
  name: string;
  description?: string;
  articles: Article[];
  order: number;
}

// 关注关系
interface SpaceFollow {
  id: string;
  userId: number;
  spaceId: string;
  followDate: string;
}
```

### 后端API需求

| API端点 | 方法 | 功能 | 状态 |
|---------|------|------|------|
| `/spaces` | GET | 获取空间列表 | 待开发 |
| `/spaces/:id` | GET | 获取空间详情 | 待开发 |
| `/spaces` | POST | 创建空间 | 待开发 |
| `/spaces/:id` | PUT | 更新空间 | 待开发 |
| `/spaces/:id` | DELETE | 删除空间 | 待开发 |
| `/spaces/:id/follow` | POST | 关注空间 | 待开发 |
| `/spaces/:id/unfollow` | DELETE | 取消关注 | 待开发 |
| `/spaces/:id/articles` | GET | 获取空间文章 | 待开发 |
| `/spaces/:id/articles` | POST | 添加文章到空间 | 待开发 |
| `/user/spaces` | GET | 获取用户空间 | 待开发 |
| `/user/followed-spaces` | GET | 获取关注的空间 | 待开发 |

### 数据库设计

```sql
-- 空间表
CREATE TABLE spaces (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  cover_url VARCHAR(255),
  author_id INT NOT NULL,
  category VARCHAR(50),
  tags JSON,
  is_public BOOLEAN DEFAULT true,
  article_count INT DEFAULT 0,
  follower_count INT DEFAULT 0,
  create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_author (author_id),
  INDEX idx_category (category),
  INDEX idx_create_time (create_at)
);

-- 空间关注表
CREATE TABLE space_follows (
  id VARCHAR(36) PRIMARY KEY,
  user_id INT NOT NULL,
  space_id VARCHAR(36) NOT NULL,
  create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_follow (user_id, space_id),
  INDEX idx_user (user_id),
  INDEX idx_space (space_id)
);

-- 空间分组表
CREATE TABLE space_sections (
  id VARCHAR(36) PRIMARY KEY,
  space_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  order_index INT DEFAULT 0,
  create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_space (space_id)
);

-- 空间文章关联表
CREATE TABLE space_articles (
  id VARCHAR(36) PRIMARY KEY,
  space_id VARCHAR(36) NOT NULL,
  article_id VARCHAR(36) NOT NULL,
  section_id VARCHAR(36),
  order_index INT DEFAULT 0,
  create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_space_article (space_id, article_id),
  INDEX idx_space (space_id),
  INDEX idx_article (article_id)
);
```

## 🎯 优先级规划

### P0 - 核心功能 (第一阶段)
- [ ] 空间基础CRUD API
- [ ] 空间列表和详情页面
- [ ] 空间创建流程
- [ ] 关注/取消关注功能

### P1 - 重要功能 (第二阶段)
- [ ] 空间搜索和筛选
- [ ] 内容添加到空间
- [ ] 我的空间管理
- [ ] 空间分组功能

### P2 - 增强功能 (第三阶段)
- [ ] 空间权限管理
- [ ] 关注通知
- [ ] 批量操作
- [ ] 高级统计

## 🔧 开发建议

### 前端开发
1. **复用现有组件**: 利用现有的ArticleCard、UserAvatar等组件
2. **状态管理**: 使用React Query管理空间数据缓存
3. **路由设计**: `/spaces`, `/spaces/:id`, `/my-spaces`, `/spaces/create`
4. **响应式设计**: 确保移动端体验

### 后端开发
1. **API设计**: 遵循RESTful规范，支持分页和筛选
2. **权限控制**: 实现基于角色的权限管理
3. **性能优化**: 空间列表查询优化，缓存热门空间
4. **数据一致性**: 关注数、文章数等统计数据一致性

### 测试策略
1. **单元测试**: 关键业务逻辑覆盖
2. **集成测试**: API接口测试
3. **E2E测试**: 空间创建和关注流程
4. **性能测试**: 大量空间数据加载测试

## 📈 数据埋点需求

### 空间相关埋点
```typescript
// 空间浏览
track('space_view', {
  space_id: string,
  space_name: string,
  space_category: string,
  author_id: number,
  view_duration?: number
});

// 空间关注
track('space_follow', {
  space_id: string,
  space_name: string,
  author_id: number,
  follow_source: 'discovery' | 'search'
});

// 空间创建
track('space_create', {
  space_id: string,
  space_category: string,
  is_public: boolean,
  section_count: number
});
```

## 🚀 部署计划

### 阶段1: 原型集成 (2周)
- [ ] 将HTML原型转换为React组件
- [ ] 集成到现有项目架构
- [ ] 基础API接口开发

### 阶段2: 核心功能 (4周)
- [ ] 完整的CRUD功能实现
- [ ] 关注系统开发
- [ ] 数据库设计和优化

### 阶段3: 功能完善 (3周)
- [ ] 搜索和筛选功能
- [ ] 权限管理系统
- [ ] 性能优化和测试

### 阶段4: 上线部署 (1周)
- [ ] 生产环境部署
- [ ] 监控和日志配置
- [ ] 用户反馈收集

---

*文档版本: v1.0*
*最后更新: 2024-11-17*
*负责人: Claude Code*