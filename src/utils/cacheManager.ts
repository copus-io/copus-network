/**
 * 🔍 SEARCH: cache-manager-system
 * Comprehensive caching system for performance optimization
 */

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  key: string;
}

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of items
}

export class CacheManager {
  private cache: Map<string, CacheItem<any>>;
  private config: CacheConfig;

  constructor(config: CacheConfig = { ttl: 5 * 60 * 1000, maxSize: 100 }) {
    this.cache = new Map();
    this.config = config;
  }

  /**
   * Set cache item with automatic expiration
   */
  set<T>(key: string, data: T, customTTL?: number): void {
    const now = Date.now();
    const ttl = customTTL || this.config.ttl;
    const item: CacheItem<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl,
      key,
    };

    // Remove expired items if we're at max capacity
    if (this.cache.size >= this.config.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, item);
  }

  /**
   * Get cache item if not expired
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remove specific key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove expired items
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0, // Would need to track hits/misses for accurate rate
    };
  }
}

// Create singleton instances for different data types
export const articleCache = new CacheManager({
  ttl: 10 * 60 * 1000, // 10 minutes for articles
  maxSize: 50,
});

export const imageCache = new CacheManager({
  ttl: 30 * 60 * 1000, // 30 minutes for images
  maxSize: 200,
});

export const userCache = new CacheManager({
  ttl: 5 * 60 * 1000, // 5 minutes for user data
  maxSize: 30,
});

/**
 * 🔍 SEARCH: cache-with-api
 * Cache-aware API request wrapper
 */
export const cacheWithApi = async <T>(
  key: string,
  apiCall: () => Promise<T>,
  cache: CacheManager = articleCache,
  customTTL?: number
): Promise<T> => {
  // Try cache first
  const cached = cache.get<T>(key);
  if (cached !== null) {
    console.log('📦 Cache hit for:', key);
    return cached;
  }

  // Make API call and cache result
  console.log('🌐 Cache miss, making API call for:', key);
  try {
    const data = await apiCall();
    cache.set(key, data, customTTL);
    return data;
  } catch (error) {
    console.error('❌ API call failed for:', key, error);
    throw error;
  }
};

/**
 * 🔍 SEARCH: cache-preloader
 * Preload common data
 */
export const preloadCommonData = () => {
  // Auto-cleanup every 5 minutes
  setInterval(() => {
    articleCache.cleanup();
    imageCache.cleanup();
    userCache.cleanup();
  }, 5 * 60 * 1000);
};

// Initialize preloading when module loads
if (typeof window !== 'undefined') {
  preloadCommonData();
}