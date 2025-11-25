/**
 * Environment detection and configuration utilities
 * Auto-detect current runtime environment based on API URL
 */

export type Environment = 'development' | 'test' | 'staging' | 'production';

/**
 * Auto-detect environment based on API URL
 * - api-test.copus.network -> test environment
 * - api-prod.copus.network -> production environment
 */
export const detectEnvironmentFromAPI = (): Environment => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

  if (apiBaseUrl.includes('api-test.copus.network')) {
    return 'test';
  }

  if (apiBaseUrl.includes('api-prod.copus.network')) {
    return 'production';
  }

  // Default to VITE_APP_ENV
  const appEnv = import.meta.env.VITE_APP_ENV as Environment;
  return appEnv || 'development';
};

/**
 * Get current environment information
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
 * Environment configuration mapping
 */
export const environmentConfigs = {
  development: {
    name: 'Development Environment',
    apiBaseUrl: 'https://api-test.copus.network/copusV2',
    appUrl: 'http://localhost:5177',
    debug: true,
  },
  test: {
    name: 'Test Environment',
    apiBaseUrl: 'https://api-test.copus.network/copusV2',
    appUrl: 'https://test.copus.network',
    debug: true,
  },
  staging: {
    name: 'Staging Environment',
    apiBaseUrl: 'https://api-test.copus.network/copusV2',
    appUrl: 'https://test.copus.network',
    debug: false,
  },
  production: {
    name: 'Production Environment',
    apiBaseUrl: 'https://api-prod.copus.network/copusV2',
    appUrl: 'https://copus.network',
    debug: false,
  },
};

/**
 * Get current environment configuration
 */
export const getEnvironmentConfig = () => {
  const env = detectEnvironmentFromAPI();
  return environmentConfigs[env];
};

/**
 * Log current environment information to console
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