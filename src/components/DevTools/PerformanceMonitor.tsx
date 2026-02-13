/**
 * 🔍 SEARCH: performance-monitor-component
 * Development performance monitoring overlay - only shows in development mode
 */
import React, { useState, useEffect } from 'react';
import { articleCache, imageCache, userCache } from '../../utils/cacheManager';
import { resourcePreloader } from '../../utils/resourcePreloader';
import { cssOptimizer } from '../../utils/cssOptimizer';

interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  totalBlockingTime: number;
}

interface CacheStats {
  articles: number;
  images: number;
  users: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats>({ articles: 0, images: 0, users: 0 });
  const [apiRequests, setApiRequests] = useState<number>(0);

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  useEffect(() => {
    // Collect performance metrics
    const collectMetrics = () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');

        const paintMetrics = paint.reduce((acc, entry) => {
          if (entry.name === 'first-paint') acc.firstPaint = entry.startTime;
          if (entry.name === 'first-contentful-paint') acc.firstContentfulPaint = entry.startTime;
          return acc;
        }, { firstPaint: 0, firstContentfulPaint: 0 });

        setMetrics({
          pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstPaint: paintMetrics.firstPaint,
          firstContentfulPaint: paintMetrics.firstContentfulPaint,
          largestContentfulPaint: 0, // Would need observer for LCP
          totalBlockingTime: 0, // Would need observer for TBT
        });
      }
    };

    // Update cache stats
    const updateCacheStats = () => {
      setCacheStats({
        articles: articleCache.stats().size,
        images: imageCache.stats().size,
        users: userCache.stats().size,
      });
    };

    // Count API requests (simple counter)
    let requestCount = 0;
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      requestCount++;
      setApiRequests(requestCount);
      return originalFetch.apply(this, args);
    };

    collectMetrics();
    updateCacheStats();

    // Update cache stats every 5 seconds
    const interval = setInterval(updateCacheStats, 5000);

    return () => {
      clearInterval(interval);
      window.fetch = originalFetch;
    };
  }, []);

  // Toggle visibility with Ctrl/Cmd + Shift + P
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setIsVisible(!isVisible);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isVisible]);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-gray-800 text-white px-3 py-2 rounded text-xs hover:bg-gray-700"
        >
          📊 Perf
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-gray-900 text-white rounded-lg shadow-xl z-50 p-4 text-xs font-mono">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-bold text-green-400">⚡ Performance Monitor</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Performance Metrics */}
      <div className="mb-4">
        <h4 className="text-blue-400 mb-2">📈 Core Metrics</h4>
        {metrics && (
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Page Load:</span>
              <span className={metrics.pageLoadTime < 1000 ? 'text-green-400' : 'text-yellow-400'}>
                {metrics.pageLoadTime.toFixed(0)}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>DOM Ready:</span>
              <span className={metrics.domContentLoaded < 500 ? 'text-green-400' : 'text-yellow-400'}>
                {metrics.domContentLoaded.toFixed(0)}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>First Paint:</span>
              <span className={metrics.firstPaint < 1500 ? 'text-green-400' : 'text-yellow-400'}>
                {metrics.firstPaint.toFixed(0)}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>FCP:</span>
              <span className={metrics.firstContentfulPaint < 1800 ? 'text-green-400' : 'text-yellow-400'}>
                {metrics.firstContentfulPaint.toFixed(0)}ms
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Cache Stats */}
      <div className="mb-4">
        <h4 className="text-purple-400 mb-2">💾 Cache Status</h4>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Articles:</span>
            <span className="text-green-400">{cacheStats.articles} cached</span>
          </div>
          <div className="flex justify-between">
            <span>Images:</span>
            <span className="text-green-400">{cacheStats.images} cached</span>
          </div>
          <div className="flex justify-between">
            <span>Users:</span>
            <span className="text-green-400">{cacheStats.users} cached</span>
          </div>
        </div>
      </div>

      {/* Network Stats */}
      <div className="mb-4">
        <h4 className="text-orange-400 mb-2">🌐 Network</h4>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>API Requests:</span>
            <span className="text-yellow-400">{apiRequests}</span>
          </div>
          <div className="flex justify-between">
            <span>Preloaded:</span>
            <span className="text-green-400">{resourcePreloader.getStats().total}</span>
          </div>
        </div>
      </div>

      {/* Optimization Stats */}
      <div className="mb-4">
        <h4 className="text-cyan-400 mb-2">⚡ Optimizations</h4>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>CSS Rules:</span>
            <span className="text-green-400">{cssOptimizer.getStats().loaded}</span>
          </div>
          <div className="flex justify-between">
            <span>Resources:</span>
            <span className="text-blue-400">{resourcePreloader.getStats().loaded}</span>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="text-gray-400 text-xs mt-3 pt-2 border-t border-gray-700">
        💡 Press Cmd/Ctrl+Shift+P to toggle
      </div>
    </div>
  );
};