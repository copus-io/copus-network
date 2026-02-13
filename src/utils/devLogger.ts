/**
 * Development logging utility
 */

interface LogContext {
  component?: string;
  action?: string;
  endpoint?: string;
  userId?: number;
  [key: string]: any;
}

class DevLogger {
  private isEnabled = process.env.NODE_ENV !== 'production';

  /**
   * Log API calls with context
   */
  apiCall(endpoint: string, data: any, context: LogContext = {}) {
    if (!this.isEnabled) return;

    console.log(`🔄 API Call: ${endpoint}`, {
      data,
      ...context,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log API responses with timing
   */
  apiResponse(endpoint: string, response: any, duration: number, context: LogContext = {}) {
    if (!this.isEnabled) return;

    console.log(`✅ API Response: ${endpoint} (${duration}ms)`, {
      response,
      duration,
      ...context,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log API errors with context
   */
  apiError(endpoint: string, error: any, context: LogContext = {}) {
    if (!this.isEnabled) return;

    console.error(`❌ API Error: ${endpoint}`, {
      error,
      ...context,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log general info
   */
  info(message: string, data?: any, context: LogContext = {}) {
    if (!this.isEnabled) return;

    console.log(`ℹ️ ${message}`, {
      data,
      ...context,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log warnings
   */
  warn(message: string, data?: any, context: LogContext = {}) {
    if (!this.isEnabled) return;

    console.warn(`⚠️ ${message}`, {
      data,
      ...context,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log errors
   */
  error(message: string, error?: any, context: LogContext = {}) {
    if (!this.isEnabled) return;

    console.error(`💥 ${message}`, {
      error,
      ...context,
      timestamp: new Date().toISOString()
    });
  }
}

export const devLog = new DevLogger();