# 🔗 社交链接API需求文档

> 📋 **致：** 国君（后端开发）
> 📅 **日期：** 2024-12-30
> 👥 **前端：** dadao & 小薇
> 🎯 **目标：** 实现真实可上线的社交链接功能

---

## 🚨 当前问题分析

### ❌ 失败的API调用
```bash
GET  http://api-test.copus.network/copusV2/client/user/socialLink/links       → net::ERR_TIMED_OUT
POST http://api-test.copus.network/copusV2/client/user/socialLink/edit        → net::ERR_TIMED_OUT
POST http://api-test.copus.network/copusV2/client/user/socialLink/delete      → net::ERR_TIMED_OUT
```

### ✅ 正常工作的API参考
```bash
GET  http://api-test.copus.network/copusV2/client/user/userInfo               → ✅ 正常
GET  http://api-test.copus.network/copusV2/client/myHome/userInfo             → ✅ 正常
GET  http://api-test.copus.network/copusV2/client/myHome/pageMyLikedArticle   → ✅ 正常
POST http://api-test.copus.network/copusV2/client/auth/login                  → ✅ 正常
```

### 🔍 发现的问题
1. **新API端点不存在**：`/client/user/socialLink/*` 系列接口返回超时
2. **存在旧API冲突**：代码中还有 `/client/user/social-links` 旧接口
3. **需要API统一**：建议使用新的RESTful风格设计

---

## 📋 需要实现的API接口

### 1️⃣ 获取用户社交链接列表
```http
GET /client/user/socialLink/links
Authorization: Bearer {token}
```

**响应格式：**
```json
{
  "status": 1,
  "data": [
    {
      "id": 123,
      "userId": 456,
      "title": "GitHub",
      "linkUrl": "https://github.com/username",
      "iconUrl": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQi...",
      "sortOrder": 0
    },
    {
      "id": 124,
      "userId": 456,
      "title": "其他链接",
      "linkUrl": "https://space.bilibili.com/4079592",
      "iconUrl": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQi...",
      "sortOrder": 1
    }
  ],
  "msg": "获取成功"
}
```

### 2️⃣ 创建/编辑社交链接
```http
POST /client/user/socialLink/edit
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数：**
```json
{
  "title": "GitHub",
  "linkUrl": "https://github.com/username",
  "iconUrl": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQi...",
  "sortOrder": 0
}
```

**响应格式：**
```json
{
  "status": 1,
  "data": {
    "id": 123,
    "userId": 456,
    "title": "GitHub",
    "linkUrl": "https://github.com/username",
    "iconUrl": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQi...",
    "sortOrder": 0
  },
  "msg": "保存成功"
}
```

### 3️⃣ 删除社交链接
```http
POST /client/user/socialLink/delete
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数：**
```json
{
  "id": 123
}
```

**响应格式：**
```json
{
  "status": 1,
  "data": true,
  "msg": "删除成功"
}
```

---

## 🗄️ 数据库表结构建议

```sql
CREATE TABLE user_social_links (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(50) NOT NULL COMMENT '平台名称：GitHub、Twitter、其他链接等',
    link_url VARCHAR(500) NOT NULL COMMENT '链接地址',
    icon_url TEXT COMMENT 'base64编码的SVG图标',
    sort_order INT DEFAULT 0 COMMENT '排序字段，数字越小越靠前',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_user_id (user_id),
    INDEX idx_sort_order (sort_order),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🔐 认证要求

- **认证方式**：Bearer Token (与现有API保持一致)
- **权限控制**：用户只能管理自己的社交链接
- **数据验证**：
  - `linkUrl` 需要是有效的URL格式
  - `title` 长度限制 1-50 字符
  - `iconUrl` 支持base64编码的SVG

---

## 🚀 业务逻辑要求

### 创建/编辑逻辑
- 如果传入的数据不包含 `id`，则创建新记录
- 如果传入的数据包含 `id`，则更新现有记录
- `sortOrder` 如果不传，默认设为当前用户链接数量
- 同一用户的 `sortOrder` 不能重复

### 删除逻辑
- 删除后自动调整其他链接的 `sortOrder`
- 确保用户只能删除自己的链接

### 查询逻辑
- 按 `sortOrder` 升序返回
- 只返回当前用户的链接

---

## 🌐 CORS配置

确保API允许来自前端开发服务器的跨域请求：
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## 📝 错误处理

### 常见错误码
- `401` - Token无效或过期
- `403` - 权限不足（尝试操作其他用户的链接）
- `404` - 链接不存在
- `422` - 参数验证失败

### 错误响应格式
```json
{
  "status": 0,
  "data": "",
  "msg": "具体错误信息"
}
```

---

## 🧪 测试建议

1. **基础功能测试**
   - 创建社交链接
   - 获取社交链接列表
   - 更新社交链接
   - 删除社交链接

2. **权限测试**
   - 未登录用户访问
   - 用户A操作用户B的链接

3. **数据验证测试**
   - 无效的URL格式
   - 超长的title
   - 重复的sortOrder

---

## 🎯 优先级

### P0 (最高优先级 - 今天完成)
- [x] `GET /client/user/socialLink/links` - 获取链接列表
- [x] `POST /client/user/socialLink/edit` - 创建/编辑链接
- [x] `POST /client/user/socialLink/delete` - 删除链接

### P1 (后续优化)
- [ ] 批量排序接口
- [ ] 链接有效性验证
- [ ] 图标上传支持

---

## 🤝 前后端配合

### 前端已完成：
- ✅ 社交链接管理UI组件
- ✅ UserContext状态管理
- ✅ API调用封装
- ✅ 错误处理机制

### 等待后端：
- ⏳ API接口实现
- ⏳ 数据库表创建
- ⏳ CORS配置

### 联调计划：
1. 后端完成接口 → 前端测试
2. 发现问题 → 快速修复
3. 功能验证 → 准备上线

---

**小薇的话**：国君加油！🚀 这个功能实现后，Copus就能真正体现"开放互联网"的理念了～ 让用户自由连接各个平台，打破信息孤岛！✨

有任何技术问题随时找小薇讨论哦！💕