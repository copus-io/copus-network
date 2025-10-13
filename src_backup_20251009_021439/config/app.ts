// 应用配置文件
export const APP_CONFIG = {
  // API配置 - 使用环境变量
  API: {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api-test.copus.network',
    TIMEOUT: 10000,
    // 开发模式下的行为配置
    DEV_MODE: {
      // 当API失败时自动降级到Demo模式
      AUTO_FALLBACK_TO_DEMO: true,
      // 跳过token验证（仅开发环境）
      SKIP_TOKEN_VALIDATION: false,
      // 使用模拟数据而不调用真实API
      USE_MOCK_DATA: false,
    }
  },

  // 用户体验配置
  UX: {
    // 显示友好的错误信息而不是技术错误
    FRIENDLY_ERROR_MESSAGES: true,
    // 自动重试失败的请求次数
    AUTO_RETRY_COUNT: 1,
    // 长时间无操作后提示重新登录的时间（分钟）
    AUTO_LOGOUT_WARNING_MINUTES: 30,
  },

  // Demo模式配置
  DEMO: {
    // 是否启用Demo模式
    ENABLED: true,
    // Demo数据刷新间隔（毫秒）
    REFRESH_INTERVAL: 0, // 0表示不自动刷新
    // Demo模式下显示的提示信息
    NOTICE_MESSAGE: '😊 正在展示演示数据，登录后可查看真实宝藏',
  }
};

// 根据环境变量调整配置
if (import.meta.env.DEV) {
  // 开发环境配置
  APP_CONFIG.API.DEV_MODE.AUTO_FALLBACK_TO_DEMO = true;
  console.log('🔧 开发模式已启用，API失败时将自动降级到Demo模式');
}

if (import.meta.env.PROD) {
  // 生产环境配置
  APP_CONFIG.API.DEV_MODE.AUTO_FALLBACK_TO_DEMO = false;
  console.log('🏭 生产模式，严格的API验证');
}

// 导出便捷的检查函数
export const isDevMode = () => import.meta.env.DEV;
export const isProdMode = () => import.meta.env.PROD;
export const shouldUseDemoFallback = () =>
  APP_CONFIG.API.DEV_MODE.AUTO_FALLBACK_TO_DEMO && isDevMode();