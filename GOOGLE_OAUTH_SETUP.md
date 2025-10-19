# Google OAuth 配置指南 - Localhost 开发环境

## 问题
在 localhost 开发时，Google 登录会报错：`Error 400: redirect_uri_mismatch`

## 解决方案

### 1. 访问 Google Cloud Console
- URL: https://console.cloud.google.com/
- 选择项目（当前使用的 Client ID: `696055191724-eqoc3hr4hjsh87povonhivdvrggae6hq.apps.googleusercontent.com`）

### 2. 进入凭据配置
- 导航到：**API 和服务** > **凭据**
- 找到 OAuth 2.0 客户端 ID
- 点击右侧的**编辑**图标（铅笔）

### 3. 添加以下配置

#### 已获授权的 JavaScript 来源
添加以下 URL（如果还没有）：
```
http://localhost:5177
https://test.copus.io
https://copus.io
```

#### 已获授权的重定向 URI
添加以下 URL（如果还没有）：
```
http://localhost:5177/login
https://test.copus.io/callback
https://copus.io/callback
```

### 4. 保存配置
- 点击**保存**按钮
- ⚠️ **重要**: 配置需要 **5-10 分钟**才能生效
- 在此期间可能仍然会看到 `redirect_uri_mismatch` 错误

### 5. 等待并测试
- 等待至少 10 分钟
- 清除浏览器缓存（可选）
- 重新尝试 Google 登录

## 验证配置

### 检查代码日志
打开浏览器控制台（F12），点击 Google 登录，应该看到：
```
🔍 Starting Google OAuth process...
✅ Got Google OAuth URL: https://accounts.google.com/o/oauth2/v2/auth?...
🔍 Decoded OAuth URL: ...
🔧 Replaced redirect_uri: {
  from: "https://test.copus.io/callback",
  to: "http://localhost:5177/login"
}
🚀 Final redirect URL: ...
```

### 检查实际请求
在 Google 错误页面的 URL 中查找 `redirect_uri` 参数，应该是：
```
redirect_uri=http%3A%2F%2Flocalhost%3A5177%2Flogin
```
（URL 编码后的 `http://localhost:5177/login`）

## 常见问题

### Q1: 已经添加了 redirect_uri，但还是报错？
A: Google 的配置需要时间同步，请等待 5-10 分钟后重试。

### Q2: 生产环境也会受影响吗？
A: 不会。代码会自动检测环境：
- localhost: 使用 `http://localhost:5177/login`
- 生产环境: 使用 `https://test.copus.io/callback` 或 `https://copus.io/callback`

### Q3: 如何确认配置已生效？
A: 当 Google 登录不再显示 `redirect_uri_mismatch` 错误时，配置已生效。

## 截图示例

### 正确的配置应该如下所示：

**已获授权的 JavaScript 来源:**
```
1. http://localhost:5177
2. https://test.copus.io
3. https://copus.io
```

**已获授权的重定向 URI:**
```
1. http://localhost:5177/login
2. https://test.copus.io/callback
3. https://copus.io/callback
```

## 技术细节

代码位置: `src/screens/Login/Login.tsx` (第 210-231 行)

```typescript
if (isLocalhost) {
  // Replace the redirect_uri parameter with localhost
  const localhostRedirect = `http://localhost:5177/login`;

  const redirectUriRegex = /redirect_uri=([^&]+)/;
  const match = oauthUrl.match(redirectUriRegex);

  if (match) {
    const currentRedirectUri = match[1];
    const newRedirectUri = encodeURIComponent(localhostRedirect);
    finalOauthUrl = oauthUrl.replace(currentRedirectUri, newRedirectUri);
  }
}
```

## 联系支持

如果按照上述步骤操作后仍有问题，请提供：
1. 浏览器控制台的完整日志
2. Google 错误页面的完整 URL
3. Google Cloud Console 中的截图（凭据配置页面）
