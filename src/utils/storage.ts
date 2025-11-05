/**
 * Storage utility that abstracts localStorage and sessionStorage
 * based on the "Remember me" preference
 */

const REMEMBER_ME_KEY = 'copus_remember_me_preference';

/**
 * Get the storage type based on remember me preference
 */
const getStorage = (): Storage => {
  // Check if remember me is enabled (default to true for backward compatibility)
  const rememberMe = localStorage.getItem(REMEMBER_ME_KEY);

  if (rememberMe === 'false') {
    return sessionStorage;
  }

  return localStorage;
};

/**
 * Set the remember me preference
 */
export const setRememberMePreference = (remember: boolean): void => {
  localStorage.setItem(REMEMBER_ME_KEY, remember.toString());
};

/**
 * Get the remember me preference
 */
export const getRememberMePreference = (): boolean => {
  const preference = localStorage.getItem(REMEMBER_ME_KEY);
  return preference !== 'false'; // Default to true
};

/**
 * Get an item from the appropriate storage
 */
export const getItem = (key: string): string | null => {
  // Try both storages for backward compatibility
  return getStorage().getItem(key) || localStorage.getItem(key) || sessionStorage.getItem(key);
};

/**
 * Set an item in the appropriate storage
 */
export const setItem = (key: string, value: string): void => {
  getStorage().setItem(key, value);
};

/**
 * Remove an item from both storages
 */
export const removeItem = (key: string): void => {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
};

/**
 * Clear all items from both storages
 */
export const clear = (): void => {
  localStorage.clear();
  sessionStorage.clear();
};

/**
 * Migrate data from localStorage to sessionStorage when remember me is disabled
 */
export const migrateToSessionStorage = (): void => {
  const keysToMigrate = ['copus_token', 'copus_user'];

  keysToMigrate.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      sessionStorage.setItem(key, value);
      localStorage.removeItem(key);
    }
  });
};

/**
 * Migrate data from sessionStorage to localStorage when remember me is enabled
 */
export const migrateToLocalStorage = (): void => {
  const keysToMigrate = ['copus_token', 'copus_user'];

  keysToMigrate.forEach(key => {
    const value = sessionStorage.getItem(key);
    if (value) {
      localStorage.setItem(key, value);
      sessionStorage.removeItem(key);
    }
  });
};
