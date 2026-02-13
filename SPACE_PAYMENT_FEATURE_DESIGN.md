# 空间付费功能设计文档

## 1. 功能概述

### 核心理念
- **买断制解锁**：用户一次性付费即可永久访问付费空间的所有内容
- **混合内容模式**：空间可包含免费内容（预览/引流）和付费内容
- **创作者变现**：为空间创建者提供内容变现渠道

### 用户场景
- **空间创建者**：可设置空间为付费模式，设定解锁价格，管理付费/免费内容
- **空间访客**：可浏览免费内容，付费解锁完整空间内容
- **已付费用户**：永久访问已购买空间的所有内容

## 2. 功能模块设计

### 2.1 空间付费设置模块
- [ ] **空间类型配置**
  - 免费空间（默认）
  - 付费空间
  - 混合空间（部分内容付费）

- [ ] **定价设置**
  - 空间解锁价格设定（USDT/USDC）
  - 支持多币种定价
  - 价格修改历史记录

- [ ] **内容权限管理**
  - 标记付费/免费内容
  - 批量权限设置
  - 内容预览设置（字数/图片数量限制）

### 2.2 用户权限系统
- [ ] **权限判断逻辑**
  - 空间所有者：完全访问权限
  - 已付费用户：完整内容访问权限
  - 未付费用户：仅免费内容访问权限

- [ ] **访问控制**
  - 内容级别的权限检查
  - 动态内容加载（付费内容需验证权限）
  - 防爬虫/盗链保护

### 2.3 支付系统集成
- [ ] **支付流程设计**
  - 复用现有 x402 支付协议
  - 支持 Base/XLayer 网络
  - MetaMask/OKX/Coinbase 钱包集成

- [ ] **交易管理**
  - 支付记录存储
  - 交易状态追踪
  - 退款机制（特殊情况）

### 2.4 内容展示优化
- [ ] **付费内容标识**
  - 锁图标/付费标签
  - 模糊预览效果
  - 解锁提示信息

- [ ] **免费内容预览**
  - 精选免费文章展示
  - 空间简介/创作者信息
  - 付费内容数量/价值展示

## 3. 数据库设计

### 3.1 空间表扩展 (spaces)
```sql
ALTER TABLE spaces ADD COLUMN:
- payment_type ENUM('free', 'paid', 'hybrid') DEFAULT 'free'
- unlock_price DECIMAL(10,6) DEFAULT NULL  -- USDT价格
- unlock_price_currency VARCHAR(10) DEFAULT 'USDT'
- total_revenue DECIMAL(15,6) DEFAULT 0
- subscriber_count INT DEFAULT 0
- payment_enabled BOOLEAN DEFAULT false
```

### 3.2 内容权限表 (content_permissions)
```sql
CREATE TABLE content_permissions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  space_id BIGINT NOT NULL,
  article_id BIGINT NOT NULL,
  is_paid_content BOOLEAN DEFAULT false,
  preview_length INT DEFAULT NULL,  -- 免费预览字数
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (space_id) REFERENCES spaces(id),
  FOREIGN KEY (article_id) REFERENCES articles(id),
  UNIQUE KEY unique_space_article (space_id, article_id)
);
```

### 3.3 空间购买记录表 (space_purchases)
```sql
CREATE TABLE space_purchases (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  space_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  purchase_price DECIMAL(10,6) NOT NULL,
  purchase_currency VARCHAR(10) NOT NULL,
  transaction_hash VARCHAR(255),
  payment_network VARCHAR(50),
  wallet_address VARCHAR(255),
  purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',

  FOREIGN KEY (space_id) REFERENCES spaces(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_user_space (user_id, space_id)
);
```

## 4. API 接口设计

### 4.1 空间付费设置
```typescript
// 设置空间付费模式
POST /api/spaces/{spaceId}/payment-config
{
  paymentType: 'free' | 'paid' | 'hybrid',
  unlockPrice?: number,
  currency?: 'USDT' | 'USDC'
}

// 获取空间付费信息
GET /api/spaces/{spaceId}/payment-info
Response: {
  paymentType: string,
  unlockPrice: number,
  currency: string,
  userHasAccess: boolean,
  freeContentCount: number,
  paidContentCount: number
}
```

### 4.2 内容权限管理
```typescript
// 设置文章付费状态
PUT /api/spaces/{spaceId}/articles/{articleId}/payment
{
  isPaidContent: boolean,
  previewLength?: number
}

// 批量设置内容权限
PUT /api/spaces/{spaceId}/content-permissions
{
  articles: Array<{
    articleId: number,
    isPaidContent: boolean,
    previewLength?: number
  }>
}
```

### 4.3 支付相关接口
```typescript
// 获取空间支付信息
GET /api/spaces/{spaceId}/payment/info
Response: {
  price: number,
  currency: string,
  eip712Data: object,
  paymentInfo: object
}

// 执行空间解锁支付
POST /api/spaces/{spaceId}/payment/unlock
Headers: {
  'X-PAYMENT': string  // 支付授权header
}
```

## 5. 前端页面设计

### 5.1 空间设置页面
- [ ] **付费模式切换开关**
  - 免费/付费/混合模式选择
  - 价格设置输入框
  - 币种选择下拉框

- [ ] **内容权限管理界面**
  - 文章列表with付费状态切换
  - 批量操作功能
  - 预览长度设置

- [ ] **收益统计面板**
  - 总收益显示
  - 订阅用户数
  - 收益趋势图表

### 5.2 空间访问页面
- [ ] **付费状态展示**
  - 未解锁状态：显示解锁按钮和价格
  - 已解锁状态：显示完整内容
  - 部分免费内容预览

- [ ] **支付流程UI**
  - 复用现有PayConfirmModal组件
  - 空间特定的支付确认界面
  - 支付成功后的内容解锁动画

### 5.3 用户购买记录
- [ ] **我的购买页面**
  - 已购买空间列表
  - 购买时间和价格信息
  - 快速访问已购买空间

## 6. 实现优先级

### Phase 1: 核心付费功能 (2-3周)
1. 数据库设计和迁移
2. 基础API接口开发
3. 空间付费设置功能
4. 简单的支付流程集成

### Phase 2: 权限系统完善 (1-2周)
1. 内容权限管理系统
2. 前端权限判断和内容过滤
3. 付费内容预览功能

### Phase 3: 用户体验优化 (1-2周)
1. 支付流程UI优化
2. 空间展示页面优化
3. 用户购买记录管理
4. 收益统计功能

### Phase 4: 高级功能 (可选)
1. 动态定价策略
2. 促销和折扣功能
3. 订阅统计和分析
4. 创作者收益提现

## 7. 技术注意事项

### 7.1 安全考虑
- **防止内容泄露**：付费内容在未授权状态下不应被传输到前端
- **支付验证**：严格验证区块链交易的有效性
- **防刷单保护**：同一用户不能重复购买同一空间

### 7.2 性能优化
- **内容懒加载**：根据用户权限动态加载内容
- **缓存策略**：用户权限信息适当缓存，减少数据库查询
- **CDN保护**：付费内容需要特殊的CDN访问控制

### 7.3 兼容性
- **现有功能保持**：确保免费空间功能不受影响
- **渐进式升级**：现有空间默认为免费模式
- **API向后兼容**：新增字段使用可选参数

## 8. 成功指标

### 8.1 产品指标
- 付费空间创建数量
- 空间平均解锁率
- 单个空间平均收益
- 用户复购率

### 8.2 技术指标
- 支付成功率 > 95%
- 页面加载时间 < 2s
- API响应时间 < 500ms
- 零安全事件

---

**文档版本**: v1.0
**创建时间**: 2025-01-22
**负责团队**: Copus开发团队