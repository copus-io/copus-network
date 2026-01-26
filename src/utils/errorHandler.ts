/**
 * 🔍 SEARCH: error-handler-utility
 * Centralized error handling utility for consistent error management
 */

import { devLog } from './devLogger';

// 🔍 SEARCH: error-handler-types
export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: number;
  endpoint?: string;
  additionalData?: any;
}

// 🔍 SEARCH: error-handler-main-class
export class ErrorHandler {
  // 🔍 SEARCH: api-error-handler
  static handleApiError(
    error: any,
    context: ErrorContext,
    fallbackMessage: string = 'An error occurred'
  ): string {
    const errorMessage = error?.response?.data?.msg ||
                        error?.message ||
                        error?.toString() ||
                        fallbackMessage;

    // Log error with context for debugging
    devLog.apiError(context.endpoint || 'unknown', error, {
      component: context.component,
      action: context.action,
      userId: context.userId
    });

    // Log additional context if provided
    if (context.additionalData) {
      console.error('🔍 Additional Error Context:', context.additionalData);
    }

    return errorMessage;
  }

  // 🔍 SEARCH: validation-error-handler
  static handleValidationError(
    field: string,
    value: any,
    context: ErrorContext
  ): string {
    const message = `Invalid ${field}: ${value}`;

    devLog.userAction('validation-error', { field, value }, {
      component: context.component,
      action: context.action
    });

    return message;
  }

  // 🔍 SEARCH: user-action-error-handler
  static handleUserActionError(
    action: string,
    error: any,
    context: ErrorContext
  ): string {
    const message = this.handleApiError(error, {
      ...context,
      action: `user-action-${action}`
    });

    return message;
  }

  // 🔍 SEARCH: network-error-handler
  static handleNetworkError(error: any, context: ErrorContext): string {
    if (error?.code === 'NETWORK_ERROR' || !navigator.onLine) {
      return 'Network connection error. Please check your internet connection.';
    }

    if (error?.status === 404) {
      return 'The requested resource was not found.';
    }

    if (error?.status === 401 || error?.status === 403) {
      return 'You are not authorized to perform this action.';
    }

    if (error?.status >= 500) {
      return 'Server error occurred. Please try again later.';
    }

    return this.handleApiError(error, context);
  }
}

// 🔍 SEARCH: error-handler-shortcuts
export const handleError = ErrorHandler;