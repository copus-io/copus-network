// Application configuration file
export const APP_CONFIG = {
  // App URL - current frontend environment URL
  APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:5177',

  // API configuration - using environment variables
  API: {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api-test.copus.network',
    TIMEOUT: 10000,
    // Development mode behavior configuration
    DEV_MODE: {
      // Automatically fallback to Demo mode when API fails
      AUTO_FALLBACK_TO_DEMO: false,
      // Skip token validation (development environment only)
      SKIP_TOKEN_VALIDATION: false,
      // Use mock data instead of calling real API
      USE_MOCK_DATA: false,
    }
  },

  // User experience configuration
  UX: {
    // Show friendly error messages instead of technical errors
    FRIENDLY_ERROR_MESSAGES: true,
    // Number of automatic retries for failed requests
    AUTO_RETRY_COUNT: 1,
    // Time in minutes before prompting re-login after inactivity
    AUTO_LOGOUT_WARNING_MINUTES: 30,
  },

  // Demo mode configuration
  DEMO: {
    // Whether to enable Demo mode
    ENABLED: false,
    // Demo data refresh interval (milliseconds)
    REFRESH_INTERVAL: 0, // 0 means no auto-refresh
    // Notice message displayed in Demo mode
    NOTICE_MESSAGE: 'Showing demo data, login to view real treasures',
  }
};

// Adjust configuration based on environment variables
if (import.meta.env.DEV) {
  // Development environment configuration
  APP_CONFIG.API.DEV_MODE.AUTO_FALLBACK_TO_DEMO = false;
}

if (import.meta.env.PROD) {
  // Production environment configuration
  APP_CONFIG.API.DEV_MODE.AUTO_FALLBACK_TO_DEMO = false;
}

// Export convenience check functions
export const isDevMode = () => import.meta.env.DEV;
export const isProdMode = () => import.meta.env.PROD;
export const shouldUseDemoFallback = () =>
  APP_CONFIG.API.DEV_MODE.AUTO_FALLBACK_TO_DEMO && isDevMode();