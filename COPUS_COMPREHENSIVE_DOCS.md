# Copus 平台综合技术文档

## 📋 项目概述

Copus - Internet Treasure Map 是一个去中心化社交内容平台，通过人工策展和社区判断来发现和分享有价值的内容。本文档整合了后台管理系统、数据分析体系和空间功能的完整技术方案。

## 🎯 系统架构概览

### 核心模块
1. **内容策展平台** - 主要的用户内容发现和分享平台
2. **空间功能** - 主题内容集合和社区功能
3. **后台管理系统** - 运营管理和数据分析
4. **数据分析体系** - 用户行为分析和业务洞察

---

# 🌌 空间功能模块

## 核心概念

**空间 (Space)**: 用户创建的主题内容集合，类似于策展集合，其他用户可以关注并获取相关内容更新。

## 功能需求与原型对比

| 功能模块 | 子功能 | 原型状态 | 技术需求 | 完成度 | 优先级 |
|---------|--------|----------|----------|--------|--------|
| **空间发现** | 空间列表展示 | ✅ 已实现 | 需要API接口 | 80% | P0 |
| | 分类筛选 | ✅ 已实现 | 需要分类API | 70% | P0 |
| | 排序功能 | ✅ 已实现 | 需要排序算法 | 60% | P1 |
| | 搜索功能 | ✅ 已实现 | 需要搜索API | 50% | P1 |
| | 分页加载 | ❌ 未实现 | 需要分页逻辑 | 0% | P1 |
| **空间详情** | 基本信息展示 | ✅ 已实现 | 需要详情API | 70% | P0 |
| | 文章列表 | ✅ 已实现 | 需要内容API | 60% | P0 |
| | 分组管理 | ✅ 已实现 | 需要分组API | 40% | P1 |
| | 权限控制 | ❌ 未实现 | 需要权限系统 | 0% | P2 |
| **关注功能** | 关注/取消关注 | ✅ 已实现 | 需要关注API | 80% | P0 |
| | 关注列表 | ✅ 已实现 | 需要关注API | 70% | P0 |
| | 关注数统计 | ✅ 已实现 | 需要统计API | 60% | P1 |
| | 关注通知 | ❌ 未实现 | 需要通知系统 | 0% | P2 |
| **空间创建** | 基本信息设置 | ✅ 已实现 | 需要创建API | 80% | P0 |
| | 分步创建流程 | ✅ 已实现 | 前端逻辑完成 | 90% | P0 |
| | 标签管理 | ✅ 已实现 | 需要标签API | 70% | P1 |
| | 自定义分组 | ✅ 已实现 | 需要分组API | 60% | P1 |
| | 权限设置 | ❌ 未实现 | 需要权限API | 0% | P2 |
| **我的空间** | 空间管理 | ✅ 已实现 | 需要管理API | 70% | P0 |
| | 编辑功能 | ✅ 已实现 | 需要编辑API | 50% | P1 |
| | 删除功能 | ✅ 已实现 | 需要删除API | 50% | P1 |
| | 统计信息 | ✅ 已实现 | 需要统计API | 60% | P1 |
| **内容添加** | 添加到空间 | ✅ 已实现 | 需要添加API | 80% | P0 |
| | 选择目标空间 | ✅ 已实现 | 需要空间API | 70% | P0 |
| | 批量操作 | ❌ 未实现 | 需要批量API | 0% | P2 |

## 空间功能技术架构

### 数据类型定义
```typescript
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

interface SpaceFollow {
  id: string;
  userId: number;
  spaceId: string;
  followDate: string;
}
```

### API端点设计

| API端点 | 方法 | 功能 | 状态 | 优先级 |
|---------|------|------|------|--------|
| `/spaces` | GET | 获取空间列表 | 待开发 | P0 |
| `/spaces/:id` | GET | 获取空间详情 | 待开发 | P0 |
| `/spaces` | POST | 创建空间 | 待开发 | P0 |
| `/spaces/:id` | PUT | 更新空间 | 待开发 | P1 |
| `/spaces/:id` | DELETE | 删除空间 | 待开发 | P1 |
| `/spaces/:id/follow` | POST | 关注空间 | 待开发 | P0 |
| `/spaces/:id/unfollow` | DELETE | 取消关注 | 待开发 | P0 |
| `/spaces/:id/articles` | GET | 获取空间文章 | 待开发 | P0 |
| `/spaces/:id/articles` | POST | 添加文章到空间 | 待开发 | P0 |
| `/user/spaces` | GET | 获取用户空间 | 待开发 | P0 |
| `/user/followed-spaces` | GET | 获取关注的空间 | 待开发 | P1 |

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

---

# 🖥 后台管理系统

## 核心功能模块

### 1. 仪表盘 (Dashboard)

**核心指标概览**
- 用户总数、活跃用户数 (DAU/MAU)
- 内容总数、今日新增内容
- 空间总数、空间关注数统计
- 平台热度指标 (PV/UV)
- 收入数据 (如有付费功能)

**实时监控**
- 系统健康状态
- 异常行为告警
- 内容审核队列长度
- 用户举报处理状态

### 2. 用户管理 (User Management)

```typescript
interface UserListItem {
  id: number;
  username: string;
  email: string;
  namespace: string;
  avatar: string;
  registrationDate: string;
  lastActiveDate: string;
  status: 'active' | 'suspended' | 'banned';
  articleCount: number;
  treasureCount: number;
  followerCount: number;
  spaceCount: number;        // 新增：空间数量
  spaceFollowCount: number;  // 新增：关注的空间数
  riskLevel: 'low' | 'medium' | 'high';
}
```

### 3. 内容管理 (Content Management)

**内容列表** (扩展支持空间)
```typescript
interface ContentListItem {
  id: string;
  title: string;
  author: string;
  category: string;
  type: 'article' | 'space';  // 新增：内容类型
  createDate: string;
  status: 'published' | 'pending' | 'rejected' | 'draft';
  viewCount: number;
  likeCount: number;
  reportCount: number;
  riskScore: number;
  spaceCount?: number;  // 文章：所属空间数
  articleCount?: number; // 空间：包含文章数
}
```

**空间管理功能**
- 空间审核队列
- 空间分类管理
- 热门空间推荐
- 空间举报处理

### 4. 数据分析 (Analytics)

**空间生态分析**
- 空间创建趋势
- 空间关注分析
- 热门空间排行
- 空间活跃度统计
- 空间分类偏好分析

**用户行为分析** (扩展)
- 空间浏览行为
- 空间关注流失分析
- 空间内容消费分析
- 跨空间用户行为

---

# 📊 数据分析体系

## 数据埋点方案扩展

### 空间相关埋点

**空间浏览埋点**
```typescript
interface SpaceViewEvent {
  event: 'space_view';
  space_id: string;
  space_name: string;
  space_category: string;
  author_id: number;
  user_id?: number;
  session_id: string;
  timestamp: number;
  view_duration?: number;
  source: 'discovery' | 'search' | 'recommendation' | 'direct';
}
```

**空间交互埋点**
```typescript
interface SpaceInteractionEvent {
  event: 'space_interaction';
  action: 'follow' | 'unfollow' | 'share' | 'add_article' | 'create';
  space_id: string;
  space_name: string;
  author_id: number;
  user_id?: number;
  session_id: string;
  timestamp: number;
  source_page: string;
  additional_data?: any;
}
```

**空间内容埋点**
```typescript
interface SpaceContentEvent {
  event: 'space_content_action';
  action: 'article_click' | 'section_view' | 'content_scroll';
  space_id: string;
  article_id?: string;
  section_id?: string;
  user_id?: number;
  session_id: string;
  timestamp: number;
  position?: number;
}
```

### 核心指标体系扩展

**空间生态指标**
- 空间创建数量趋势
- 空间创建用户比例
- 平均空间关注数/用户
- 空间内容质量分布
- 空间活跃度指标

**空间消费指标**
- 空间浏览量 (PV)
- 空间独立访客数 (UV)
- 平均空间停留时间
- 空间互动率 (关注、分享)

**跨功能指标**
- 空间到文章的转化率
- 文章到空间关注的转化率
- 空间关注对用户留存的影响
- 空间功能对平台活跃度的提升

## 技术架构整合

### 前端技术栈
- **框架**: React 18 + TypeScript
- **UI组件**: 自研组件库 + Radix UI
- **状态管理**: React Context + TanStack Query
- **图表库**: Apache ECharts (后台管理)
- **构建工具**: Vite

### 后端技术栈
- **框架**: Node.js (Express/Koa)
- **数据库**: PostgreSQL (主数据) + Redis (缓存)
- **消息队列**: Redis/RabbitMQ
- **搜索引擎**: Elasticsearch
- **文件存储**: AWS S3/阿里云OSS

### 数据分析技术栈
- **数据采集**: 自研埋点 SDK
- **数据流处理**: Kafka + Spark Streaming
- **数据存储**: ClickHouse (分析) + Redis (实时)
- **数据分析**: Apache Spark
- **可视化**: Grafana + 自研报表系统

## 📅 综合实施计划

### 第一阶段 (6周) - 空间核心功能
- [ ] 空间基础CRUD API开发
- [ ] 空间列表和详情页面
- [ ] 空间创建流程集成
- [ ] 关注/取消关注功能
- [ ] 基础埋点SDK扩展

### 第二阶段 (8周) - 管理系统集成
- [ ] 后台管理系统空间模块
- [ ] 空间审核和管理工具
- [ ] 空间数据分析报表
- [ ] 完整埋点方案实施
- [ ] 权限管理系统

### 第三阶段 (6周) - 高级功能
- [ ] 空间搜索和推荐算法
- [ ] 智能内容分发
- [ ] 高级数据分析功能
- [ ] 风险控制系统
- [ ] 性能优化

### 第四阶段 (4周) - 上线部署
- [ ] 系统集成测试
- [ ] 生产环境部署
- [ ] 监控体系建设
- [ ] 用户培训和文档

## 🔒 安全与隐私

### 数据安全
- 敏感数据加密存储
- API接口权限控制
- 操作日志完整记录
- 定期安全审计
- 空间内容安全检测

### 隐私保护
- 用户数据匿名化处理
- GDPR合规性考虑
- 数据访问权限最小化原则
- 用户数据删除机制
- 空间隐私设置支持

## 💡 扩展性考虑

### 微服务架构
- 用户服务
- 内容服务
- 空间服务 (新增)
- 分析服务
- 通知服务

### 容器化部署
- Docker容器化
- Kubernetes编排
- 自动扩缩容
- 灰度发布机制
- 监控告警体系

## 📈 成功指标

### 空间功能KPI
- 空间创建数量: 月增长 20%
- 空间关注率: >15%
- 活跃空间比例: >60%
- 空间内容互动率: >10%

### 平台整体KPI
- 用户活跃度提升: 15%
- 内容消费时长增长: 25%
- 用户留存率提升: 10%
- 平台粘性改善: DAU/MAU >40%

---

*文档版本: v2.0*
*最后更新: 2024-11-17*
*负责人: Claude Code*
*涵盖模块: 空间功能 + 后台管理 + 数据分析*