# Copus 平台综合技术文档

## 📋 项目概述

**Copus Internet Treasure Map** - 一个去中心化的社交内容平台，赋能创作者并连接社区。基于React、TypeScript、Vite和Tailwind CSS构建。

### 核心理念
"互联网宝藏图" - 在AI饱和的时代，Copus强调人工策展和判断，通过"宝库"收藏系统发现和分享有价值的内容。

## 🏗 技术栈架构

### 前端技术栈
- **核心框架**: React 18.2 + TypeScript 5.9
- **构建工具**: Vite 6.0
- **样式系统**: Tailwind CSS 3.4 + Radix UI组件
- **状态管理**: React Context + TanStack Query (React Query)
- **身份验证**: Web3 (Metamask) + 邮箱/密码
- **支付系统**: x402协议 + ERC-3009 (无Gas费USDC支付)

### API配置
- **开发环境**: `https://api.test.copus.io/copusV2`
- **测试环境**: `https://api.test.copus.io/copusV2`
- **生产环境**: `https://api.copus.io/copusV2`

## 🔐 支付系统架构

### 双支付网络支持
Copus支持两个主要区块链网络的支付：

#### 1. X Layer Network (OKX)
```typescript
// X Layer配置
chainId: '0xc4', // 196 (X Layer主网)
nativeCurrency: 'OKB',
支持代币: USDC, USDT
```

#### 2. Base Network
```typescript
// Base主网配置
chainId: '0x2105', // 8453 (Base主网)
nativeCurrency: 'ETH',
支持代币: USDC
```

### 智能合约地址配置

#### X Layer网络合约地址
- **USDC合约**: `0x74b7F16337b8972027F6196A17a631aC6dE26d22`
- **USDT合约**: `0x779ded0c9e1022225f8e0630b35a9b54be713736`

#### Base网络合约地址
- **Base主网USDC**: `0x833589fcd6edb6e08f4c7c32d4f71b54bda02913`
- **Base Sepolia测试网USDC**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

### x402支付协议实现

#### 核心概念
- **无Gas费支付**: 用户签名消息（无交易），服务器支付Gas
- **ERC-3009标准**: TransferWithAuthorization元交易标准
- **高速交易**: 2-3秒 vs 常规区块链交易的60+秒

#### 支付流程
```typescript
// 1. 获取支付信息
const getPaymentEndpoint = (networkType: NetworkType) => {
  return networkType === 'xlayer'
    ? '/client/payment/okx/getTargetUrl'    // OKX API for XLayer
    : '/client/payment/base/getTargetUrl';  // Base API for Base networks
};

// 2. 生成唯一随机数
const nonce = generateNonce();

// 3. 签署授权（显示MetaMask弹窗）
const signedAuth = await signTransferWithAuthorization({
  from, to, value, validAfter, validBefore, nonce
}, window.ethereum);

// 4. 创建X-PAYMENT头部
const paymentHeader = createX402PaymentHeader(signedAuth, network, asset);
```

#### 关键API差异

**OKX API (X Layer)**:
- 端点: `GET /client/payment/okx/getTargetUrl`
- 参数: `uuid`, `name`, `verifyingContract`
- 响应: 标准x402格式

**Base API**:
- 端点: `GET /client/payment/base/getTargetUrl`
- 参数: `uuid`
- 响应: 简化格式，需要前端补充token信息

## 🔍 钱包检测系统

### MetaMask检测逻辑
为防止OKX钱包导致的误检测，实现了增强的检测算法：

```typescript
const isMetaMask = () => {
  if (!window.ethereum) return false;

  // 排除OKX特有属性
  const hasOKXFeatures = window.ethereum.isOKExWallet ||
                        window.ethereum.isOKX ||
                        window.ethereum._okx;

  return window.ethereum.isMetaMask && !hasOKXFeatures;
};
```

### 多钱包支持
- **MetaMask**: 主要Web3钱包
- **OKX Wallet**: X Layer网络优选
- **Coinbase Wallet**: Base网络支持
- **WalletConnect**: 移动端钱包连接

## 📁 项目目录结构

```
src/
├── components/          # 可复用UI组件
│   ├── ui/             # 基础UI组件（按钮、卡片等）
│   ├── ImageUploader/  # 图片上传功能
│   ├── SocialLinksManager/
│   ├── WalletSignInModal/    # 钱包选择支付界面
│   └── PayConfirmModal/      # 支付确认UI
├── screens/            # 页面级组件（路由）
│   ├── Discovery/      # 内容发现页面
│   ├── Treasury/       # 用户收藏内容集合
│   ├── Content/        # 文章详情视图（包含x402支付流程）
│   ├── MainFrame/      # 主布局包装器
│   ├── UserProfile/    # 用户个人资料页面
│   ├── Notification/   # 通知页面
│   └── Setting/        # 设置页面
├── services/           # API服务层
│   ├── api.ts          # 核心API请求处理器
│   ├── authService.ts  # 身份验证API
│   ├── articleService.ts    # 文章API
│   ├── categoryService.ts   # 分类API
│   └── notificationService.ts
├── hooks/              # 自定义React钩子
│   ├── queries/        # TanStack Query钩子
│   ├── useArticles.ts
│   ├── useAuthForm.ts
│   └── useCategories.ts
├── contexts/           # React Context提供者
│   ├── UserContext.tsx
│   ├── CategoryContext.tsx
│   ├── NotificationContext.tsx
│   └── ImagePreviewContext.tsx
├── types/              # TypeScript类型定义
│   ├── article.ts      # 包含x402支付类型
│   ├── category.ts
│   ├── notification.ts
│   └── payment.ts      # 支付相关类型定义
├── utils/              # 工具函数
│   ├── validation.ts
│   ├── categoryStyles.ts
│   ├── imageUtils.ts
│   ├── apiUtils.ts
│   ├── x402Utils.ts    # x402支付协议工具
│   └── envUtils.ts     # 环境工具
└── config/             # 应用配置
    ├── app.ts
    └── contracts.ts    # 智能合约地址配置
```

## 🎯 空间功能架构 (Space Feature)

### 核心概念
**空间 (Space)**: 用户创建的主题内容集合，类似于策展集合，其他用户可以关注并获取相关内容更新。

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

### 功能模块
1. **空间发现**: 列表展示、分类筛选、排序、搜索
2. **空间详情**: 基本信息、文章列表、分组管理
3. **关注功能**: 关注/取消关注、关注列表、统计
4. **空间创建**: 基本设置、分步流程、标签管理
5. **内容管理**: 添加文章、批量操作、权限控制

## 🔑 关键架构模式

### 服务层模式
所有API调用通过`src/services/`中的集中服务层：

```typescript
// 示例：使用AuthService
import { AuthService } from './services/authService';

const response = await AuthService.login({
  email: 'user@example.com',
  password: 'password'
});
```

### API请求处理器
`src/services/api.ts`中的`apiRequest`函数处理：
- Bearer令牌身份验证（存储在`localStorage.copus_token`）
- 自动令牌验证（JWT格式检查）
- 401/403错误处理（自动登出）
- 内容类型管理（JSON vs FormData）
- CORS错误检测

### 状态管理策略
- **TanStack Query**: 服务器状态（文章、通知等）
- **React Context**: 全局UI状态（用户、分类、通知）
- **本地状态**: 组件特定状态（useState）

## 🎨 设计系统

### 样式规范
- **Tailwind CSS**: 主要样式方法
- **设计令牌**: 一致的间距（15px, 30px）、颜色（#f23a00主红色）
- **Radix UI**: 可访问性基础组件
- **响应式**: 移动端优先设计方法

### 分类颜色编码
```typescript
// src/utils/categoryStyles.ts
const categoryStyles = {
  Art: 'green',      // 艺术 (绿色)
  Sports: 'blue',    // 体育 (蓝色)
  Technology: 'yellow', // 技术 (黄色)
  Life: 'pink'       // 生活 (粉色)
};
```

## 🔐 身份验证系统

### 身份验证流程
1. 用户通过邮箱/密码或Metamask登录
2. 令牌存储在`localStorage.copus_token`
3. 用户数据存储在`localStorage.copus_user`
4. 令牌作为`Authorization: Bearer {token}`头部发送
5. 无效令牌触发自动登出和重定向

### 表单验证
集中验证在`src/utils/validation.ts`：
```typescript
import { FormValidator, VALIDATION_RULES } from './utils/validation';

const errors = FormValidator.validateForm(values, VALIDATION_RULES);
```

## 📱 用户体验增强

### Toast通知系统
替换所有`alert()`调用：
```typescript
import { showToast } from './components/ui/toast';

showToast('Success message', 'success');
showToast('Error message', 'error');
```

### 图片处理
- 通过`ImageUploader`组件上传图片
- 通过`lazy-image`组件懒加载
- 通过`ImagePreviewContext`全局预览模态框

## 🚀 开发流程

### 分支结构与部署
- **`main`** - 生产环境 (copus.network)
- **`develop`** - 测试环境 (test.copus.network)
- **`feature/functionality-updates`** - 功能代码更改的本地开发分支
- **`content/text-updates`** - 内容/文案更新分支（队友管理）
- **`prototype/space-feature`** - 空间功能原型分支

### 工作流规则
- 直接在`feature/functionality-updates`分支工作（无子分支）
- 仅在明确请求时拉取（非自动）
- 使用纯英文提交消息，遵循conventional commits格式
- 创建PR合并到`develop`分支进行测试

### 开发命令
```bash
npm install                    # 安装依赖
npm run dev                    # 开发模式 (localhost:5177)
npm run dev:staging            # 测试环境
npm run dev:prod               # 生产环境预览
npm run build                  # 生产构建
npm run build:staging          # 测试构建
npm run build:development      # 开发构建

# 辅助脚本
./start-work.sh                # 开始工作（切换分支并同步）
./smart-push.sh                # 智能推送（推荐）
./check-teammate.sh            # 检查队友更改
```

## 📊 性能优化

### 前端性能
- **代码分割**: 路由级别的懒加载
- **图片优化**: WebP格式、懒加载、预览功能
- **缓存策略**: React Query智能缓存
- **包分析**: 定期分析打包体积

### API优化
- **请求合并**: 批量API调用
- **响应缓存**: 合理的缓存策略
- **错误重试**: 自动重试机制
- **超时处理**: 请求超时管理

## 🧪 测试策略

### 手动测试清单
推送更改前：
- 页面无错误加载
- 核心功能正常工作（登录、文章显示、宝库等）
- 无控制台错误
- 不同屏幕尺寸的响应式设计
- API调用成功且身份验证正确

### 本地开发服务器
- 运行在`http://localhost:5177`
- 热模块替换（HMR）启用
- 实时TypeScript类型检查

## 🔧 故障排除

### 常见问题解决
1. **CORS错误**: 检查API端点和头部配置
2. **钱包检测失败**: 验证钱包插件和检测逻辑
3. **支付失败**: 确认网络、合约地址和余额
4. **构建错误**: 检查TypeScript类型和依赖版本

### 调试工具
- React Developer Tools
- 钱包开发者工具
- 网络请求监控
- 控制台日志记录

## 📈 监控与分析

### 数据埋点
```typescript
// 支付相关埋点
track('payment_initiated', {
  network: string,
  token: string,
  amount: string,
  article_id: string
});

track('payment_completed', {
  transaction_id: string,
  network: string,
  duration: number
});

// 空间相关埋点
track('space_view', {
  space_id: string,
  space_category: string,
  author_id: number
});
```

### 错误监控
- API错误追踪
- 前端异常捕获
- 支付失败记录
- 性能指标监控

## 🔐 安全考虑

### 前端安全
- XSS防护（内容清理）
- CSRF保护（令牌验证）
- 安全的令牌存储
- 敏感信息加密

### 支付安全
- 签名验证
- 重放攻击防护
- 金额验证
- 网络验证

## 🌐 国际化准备

### 多语言支持架构
- 文本提取和管理
- 动态语言切换
- 日期和数字本地化
- 右到左（RTL）布局支持

## 📚 文档维护

### 文档更新流程
1. 功能开发时同步更新文档
2. API变更时更新接口文档
3. 定期审查和完善文档
4. 保持代码注释最新

---

*文档版本: v2.0*
*最后更新: 2024-11-26*
*维护者: Claude Code*
*项目状态: 积极开发中*

## 📞 支持联系

如需技术支持或有疑问，请通过以下方式联系：
- 项目仓库: GitHub Issues
- 技术讨论: 开发团队内部渠道
- 紧急问题: 直接联系项目负责人

---

**免责声明**: 本文档包含技术实现细节，仅供开发团队内部使用。涉及的智能合约地址和API端点均为实际生产环境配置，请谨慎处理。