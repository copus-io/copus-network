/**
 * 🎯 PURPOSE: Centralized debug logging system
 * 🔧 USAGE: Replace console.log with debugLog for conditional logging
 * 🚀 BENEFITS: Can be disabled in production, organized by categories
 */

// Debug categories for organized logging
export type DebugCategory =
  | 'api'
  | 'payment'
  | 'auth'
  | 'ui'
  | 'navigation'
  | 'error'
  | 'performance'
  | 'general';

// Debug configuration
interface DebugConfig {
  enabled: boolean;
  categories: DebugCategory[];
  level: 'trace' | 'debug' | 'info' | 'warn' | 'error';
}

// Default configuration - only enable in development
const DEFAULT_CONFIG: DebugConfig = {
  enabled: import.meta.env.DEV,
  categories: ['api', 'payment', 'auth', 'error'], // Only show important logs by default
  level: 'debug'
};

class DebugLogger {
  private config: DebugConfig;

  constructor(config: DebugConfig = DEFAULT_CONFIG) {
    this.config = config;
  }

  // Update configuration
  setConfig(config: Partial<DebugConfig>) {
    this.config = { ...this.config, ...config };
  }

  // Enable/disable logging
  enable() {
    this.config.enabled = true;
  }

  disable() {
    this.config.enabled = false;
  }

  // Add or remove categories
  enableCategory(category: DebugCategory) {
    if (!this.config.categories.includes(category)) {
      this.config.categories.push(category);
    }
  }

  disableCategory(category: DebugCategory) {
    this.config.categories = this.config.categories.filter(c => c !== category);
  }

  // Main logging function
  log(category: DebugCategory, message: string, ...args: any[]) {
    if (!this.config.enabled || !this.config.categories.includes(category)) {
      return;
    }

    const timestamp = new Date().toISOString().substr(11, 8);
    const categoryIcon = this.getCategoryIcon(category);
    const prefix = `[${timestamp}] ${categoryIcon} ${category.toUpperCase()}:`;

    console.log(prefix, message, ...args);
  }

  // Convenience methods for different categories
  api(message: string, ...args: any[]) {
    this.log('api', message, ...args);
  }

  payment(message: string, ...args: any[]) {
    this.log('payment', message, ...args);
  }

  auth(message: string, ...args: any[]) {
    this.log('auth', message, ...args);
  }

  ui(message: string, ...args: any[]) {
    this.log('ui', message, ...args);
  }

  navigation(message: string, ...args: any[]) {
    this.log('navigation', message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.log('error', message, ...args);
    // Always show errors regardless of category settings
    if (!this.config.categories.includes('error')) {
      console.error(`🚨 ERROR:`, message, ...args);
    }
  }

  performance(message: string, ...args: any[]) {
    this.log('performance', message, ...args);
  }

  general(message: string, ...args: any[]) {
    this.log('general', message, ...args);
  }

  // Debug function that only logs in development
  debug(message: string, ...args: any[]) {
    if (import.meta.env.DEV) {
      this.general(message, ...args);
    }
  }

  private getCategoryIcon(category: DebugCategory): string {
    const icons = {
      api: '🌐',
      payment: '💳',
      auth: '🔐',
      ui: '🎨',
      navigation: '🧭',
      error: '🚨',
      performance: '⚡',
      general: '📝'
    };
    return icons[category] || '📝';
  }

  // Performance timing utilities
  time(label: string) {
    if (this.config.enabled && this.config.categories.includes('performance')) {
      console.time(`⚡ ${label}`);
    }
  }

  timeEnd(label: string) {
    if (this.config.enabled && this.config.categories.includes('performance')) {
      console.timeEnd(`⚡ ${label}`);
    }
  }

  // Group logging
  group(title: string, category: DebugCategory = 'general') {
    if (this.config.enabled && this.config.categories.includes(category)) {
      const categoryIcon = this.getCategoryIcon(category);
      console.group(`${categoryIcon} ${title}`);
    }
  }

  groupEnd() {
    if (this.config.enabled) {
      console.groupEnd();
    }
  }

  // Table display for structured data
  table(data: any[], category: DebugCategory = 'general') {
    if (this.config.enabled && this.config.categories.includes(category)) {
      console.table(data);
    }
  }
}

// Create and export singleton instance
export const debugLog = new DebugLogger();

// Export individual methods for convenience
export const { api, payment, auth, ui, navigation, error, performance, debug } = debugLog;