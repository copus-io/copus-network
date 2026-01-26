/**
 * Production-safe logger utility
 * Only logs in development mode to prevent console pollution in production
 */

const isDev = import.meta.env.DEV;

export const logger = {
  log: (message: string, ...args: unknown[]) => {
    if (isDev) console.log(message, ...args);
  },

  warn: (message: string, ...args: unknown[]) => {
    if (isDev) console.warn(message, ...args);
  },

  error: (message: string, ...args: unknown[]) => {
    // Always log errors, even in production (for debugging critical issues)
    console.error(message, ...args);
  },

  debug: (message: string, ...args: unknown[]) => {
    if (isDev) console.debug(message, ...args);
  },

  info: (message: string, ...args: unknown[]) => {
    if (isDev) console.info(message, ...args);
  },
};

export default logger;
