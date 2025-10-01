# 环境配置说明

## 环境说明

项目支持三种环境配置：

### 开发环境 (development)
- 配置文件: `.env.development`
- API地址: `https://api.test.copus.io/copusV2`
- 用于本地开发和调试

### 测试环境 (staging)
- 配置文件: `.env.staging`
- API地址: `https://api.test.copus.io/copusV2`
- 用于测试部署和验证

### 生产环境 (production)
- 配置文件: `.env.production`
- API地址: `https://api.copus.io/copusV2`
- 用于正式生产环境

## 使用方法

### 开发运行
```bash
# 开发环境（默认）
npm run dev

# 测试环境
npm run dev:staging

# 生产环境测试
npm run dev:prod
```

### 构建部署
```bash
# 构建生产版本
npm run build

# 构建测试版本
npm run build:staging

# 构建开发版本
npm run build:development
```

## 部署流程建议

1. **开发阶段**: 使用 `npm run dev` 进行开发
2. **测试阶段**: 使用 `npm run build:staging` 构建测试版本
3. **生产部署**: 使用 `npm run build` 构建生产版本

这样就不需要手动修改API地址了！