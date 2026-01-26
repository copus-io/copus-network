/**
 * 🔍 SEARCH: dev-logger-utility
 * Development logging utility for debugging and performance monitoring
 */

// 🔍 SEARCH: dev-logger-types
export interface DevLogContext {
  component?: string;
  action?: string;
  userId?: number;
  articleId?: string | number;
  endpoint?: string;
  duration?: number;
  error?: any;
}

// 🔍 SEARCH: dev-logger-main-class
export class DevLogger {
  private static isEnabled = process.env.NODE_ENV === 'development';

  // 🔍 SEARCH: api-call-logger
  static apiCall(endpoint: string, data?: any, context?: DevLogContext) {
    if (!this.isEnabled) return;

    const timestamp = new Date().toISOString().slice(11, 23);
    console.log(
      `🌐 [${timestamp}] API Call: ${endpoint}`,
      data ? `\nData:` : '',
      data || '',
      context ? `\nContext:` : '',
      context || ''
    );
  }

  // 🔍 SEARCH: api-response-logger
  static apiResponse(endpoint: string, response: any, duration?: number, context?: DevLogContext) {
    if (!this.isEnabled) return;

    const timestamp = new Date().toISOString().slice(11, 23);
    const durationText = duration ? ` (${duration}ms)` : '';
    console.log(
      `✅ [${timestamp}] API Response: ${endpoint}${durationText}`,
      `\nStatus: ${response?.status || 'unknown'}`,
      response?.data ? `\nData count: ${Array.isArray(response.data) ? response.data.length : 'object'}` : '',
      context ? `\nContext:` : '',
      context || ''
    );
  }

  // 🔍 SEARCH: api-error-logger
  static apiError(endpoint: string, error: any, context?: DevLogContext) {
    if (!this.isEnabled) return;

    const timestamp = new Date().toISOString().slice(11, 23);
    console.error(
      `🚨 [${timestamp}] API Error: ${endpoint}`,
      `\nError: ${error?.message || error}`,
      `\nStatus: ${error?.status || 'unknown'}`,
      context ? `\nContext:` : '',
      context || ''
    );
  }

  // 🔍 SEARCH: component-render-logger
  static componentRender(componentName: string, props?: any, context?: DevLogContext) {
    if (!this.isEnabled) return;

    const timestamp = new Date().toISOString().slice(11, 23);
    console.log(
      `⚛️ [${timestamp}] Component Render: ${componentName}`,
      props ? `\nProps:` : '',
      props || '',
      context ? `\nContext:` : '',
      context || ''
    );
  }

  // 🔍 SEARCH: user-action-logger
  static userAction(action: string, data?: any, context?: DevLogContext) {
    if (!this.isEnabled) return;

    const timestamp = new Date().toISOString().slice(11, 23);
    console.log(
      `👤 [${timestamp}] User Action: ${action}`,
      data ? `\nData:` : '',
      data || '',
      context ? `\nContext:` : '',
      context || ''
    );
  }

  // 🔍 SEARCH: state-change-logger
  static stateChange(stateName: string, oldValue: any, newValue: any, context?: DevLogContext) {
    if (!this.isEnabled) return;

    const timestamp = new Date().toISOString().slice(11, 23);
    console.log(
      `📊 [${timestamp}] State Change: ${stateName}`,
      `\nOld:`, oldValue,
      `\nNew:`, newValue,
      context ? `\nContext:` : '',
      context || ''
    );
  }
}

// 🔍 SEARCH: dev-logger-shortcuts
export const devLog = DevLogger;