/**
 * 环境检测和配置工具
 * 根据API URL自动检测当前运行环境
 */

export type Environment = 'development' | 'test' | 'staging' | 'production';

/**
 * 根据API URL自动检测环境
 * - api-test.copus.network -> 测试环境
 * - api-prod.copus.network -> 生产环境
 */
export const detectEnvironmentFromAPI = (): Environment => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

  if (apiBaseUrl.includes('api-test.copus.network')) {
    return 'test';
  }

  if (apiBaseUrl.includes('api-prod.copus.network')) {
    return 'production';
  }

  // 默认根据 VITE_APP_ENV 判断
  const appEnv = import.meta.env.VITE_APP_ENV as Environment;
  return appEnv || 'development';
};

/**
 * 获取当前环境信息
 */
export const getCurrentEnvironment = () => {
  const env = detectEnvironmentFromAPI();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const appUrl = import.meta.env.VITE_APP_URL || '';

  return {
    environment: env,
    apiBaseUrl,
    appUrl,
    isProduction: env === 'production',
    isTest: env === 'test',
    isDevelopment: env === 'development',
  };
};

/**
 * 环境配置映射
 */
export const environmentConfigs = {
  development: {
    name: '开发环境',
    apiBaseUrl: 'https://api-test.copus.network/copusV2',
    appUrl: 'http://localhost:5177',
    debug: true,
  },
  test: {
    name: '测试环境',
    apiBaseUrl: 'https://api-test.copus.network/copusV2',
    appUrl: 'https://test.copus.network',
    debug: true,
  },
  staging: {
    name: '预发布环境',
    apiBaseUrl: 'https://api-test.copus.network/copusV2',
    appUrl: 'https://test.copus.network',
    debug: false,
  },
  production: {
    name: '生产环境',
    apiBaseUrl: 'https://api-prod.copus.network/copusV2',
    appUrl: 'https://copus.network',
    debug: false,
  },
};

/**
 * 获取当前环境的配置
 */
export const getEnvironmentConfig = () => {
  const env = detectEnvironmentFromAPI();
  return environmentConfigs[env];
};

/**
 * 控制台输出当前环境信息
 */
export const logEnvironmentInfo = () => {
  const envInfo = getCurrentEnvironment();
  const config = getEnvironmentConfig();

  console.group('🌍 Environment Info');
  console.log(`📊 Environment: ${config.name} (${envInfo.environment})`);
  console.log(`🔗 API Base URL: ${envInfo.apiBaseUrl}`);
  console.log(`🌐 App URL: ${envInfo.appUrl}`);
  console.log(`🐛 Debug Mode: ${config.debug ? 'Enabled' : 'Disabled'}`);
  console.groupEnd();
};