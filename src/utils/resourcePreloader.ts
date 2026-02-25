/**
 * 🔍 SEARCH: resource-preloader-system
 * Intelligent resource preloading system for better performance
 */

interface PreloadOptions {
  priority?: 'high' | 'low';
  crossOrigin?: 'anonymous' | 'use-credentials';
  as?: 'script' | 'style' | 'image' | 'font' | 'fetch';
}

interface PreloadedResource {
  url: string;
  type: string;
  loaded: boolean;
  element?: HTMLLinkElement | HTMLImageElement;
}

class ResourcePreloader {
  private preloadedResources: Map<string, PreloadedResource> = new Map();
  private criticalImages: Set<string> = new Set();
  private routeComponents: Map<string, () => Promise<any>> = new Map();

  /**
   * Preload critical images that are likely to be needed soon
   */
  preloadCriticalImages(imageUrls: string[]): void {
    imageUrls.forEach(url => {
      if (!this.criticalImages.has(url) && url && url !== 'undefined') {
        this.criticalImages.add(url);
        this.preloadImage(url, { priority: 'high' });
      }
    });
  }

  /**
   * Preload an image resource
   */
  private preloadImage(url: string, options: PreloadOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.preloadedResources.has(url)) {
        resolve();
        return;
      }

      // Use link rel=preload for high priority images
      if (options.priority === 'high') {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = url;
        link.onload = () => {
          this.preloadedResources.set(url, { url, type: 'image', loaded: true, element: link });
          resolve();
        };
        link.onerror = reject;
        document.head.appendChild(link);
      } else {
        // Use Image() for low priority preloading
        const img = new Image();
        img.onload = () => {
          this.preloadedResources.set(url, { url, type: 'image', loaded: true });
          resolve();
        };
        img.onerror = reject;
        img.src = url;
      }
    });
  }

  /**
   * Preload JavaScript modules for upcoming routes
   */
  preloadRoute(routePath: string, moduleLoader: () => Promise<any>): void {
    if (!this.routeComponents.has(routePath)) {
      this.routeComponents.set(routePath, moduleLoader);

      // Preload on idle
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          moduleLoader().catch(console.error);
        });
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
          moduleLoader().catch(console.error);
        }, 100);
      }
    }
  }

  /**
   * Preload based on user interaction patterns
   */
  onUserInteraction(linkElement: HTMLAnchorElement): void {
    const href = linkElement.getAttribute('href');
    if (!href) return;

    // Detect likely next routes based on hover/focus
    if (href.startsWith('/work/')) {
      // Preload Content page components
      this.preloadRoute('/content', () => import('../screens/Content/Content'));
    } else if (href.startsWith('/user/')) {
      // Preload UserProfile components
      this.preloadRoute('/user', () => import('../screens/UserProfile/UserProfile'));
    } else if (href === '/curate') {
      // Preload Create page components
      this.preloadRoute('/curate', () => import('../screens/Create/Create'));
    }
  }

  /**
   * Preload fonts that are used throughout the app
   */
  preloadFonts(): void {
    const fonts = [
      // Add any custom fonts here
      // 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2'
    ];

    fonts.forEach(fontUrl => {
      if (!this.preloadedResources.has(fontUrl)) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        link.href = fontUrl;
        document.head.appendChild(link);

        this.preloadedResources.set(fontUrl, {
          url: fontUrl,
          type: 'font',
          loaded: true,
          element: link
        });
      }
    });
  }

  /**
   * Intelligent preloading based on viewport and user behavior
   */
  observeVisibleImages(): void {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.getAttribute('data-src') || img.src;

          if (src && !this.preloadedResources.has(src)) {
            this.preloadImage(src, { priority: 'low' });
          }
        }
      });
    }, {
      rootMargin: '200px', // Start preloading 200px before visible
      threshold: 0.1
    });

    // Observe all images on the page
    document.querySelectorAll('img[data-src], img[src]').forEach(img => {
      observer.observe(img);
    });
  }

  /**
   * Preload next page content on hover
   */
  setupHoverPreloading(): void {
    let hoverTimeout: NodeJS.Timeout;

    document.addEventListener('mouseover', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;

      if (link && link.href) {
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
          this.onUserInteraction(link);
        }, 100); // 100ms delay to avoid preloading on quick mouseovers
      }
    });

    document.addEventListener('mouseout', () => {
      clearTimeout(hoverTimeout);
    });
  }

  /**
   * Get preload statistics for performance monitoring
   */
  getStats(): { total: number; loaded: number; hitRate: number } {
    const total = this.preloadedResources.size;
    const loaded = Array.from(this.preloadedResources.values()).filter(r => r.loaded).length;

    return {
      total,
      loaded,
      hitRate: total > 0 ? (loaded / total) * 100 : 0
    };
  }

  /**
   * Initialize all preloading strategies
   */
  init(): void {
    // Only initialize in browsers
    if (typeof window === 'undefined') return;

    // Preload fonts
    this.preloadFonts();

    // Setup hover preloading
    this.setupHoverPreloading();

    // Observe images when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.observeVisibleImages();
      });
    } else {
      this.observeVisibleImages();
    }

    // Preload likely next routes based on current page
    this.preloadLikelyRoutes();
  }

  /**
   * Preload routes that users are likely to visit next
   */
  private preloadLikelyRoutes(): void {
    const currentPath = window.location.pathname;

    // Wait a bit for the current page to load
    setTimeout(() => {
      if (currentPath === '/' || currentPath === '/copus') {
        // On homepage, users likely to visit content pages
        this.preloadRoute('/content', () => import('../screens/Content/Content'));
      } else if (currentPath.startsWith('/work/')) {
        // On content pages, users might go back to discovery or view profile
        this.preloadRoute('/user', () => import('../screens/UserProfile/UserProfile'));
      }
    }, 2000);
  }
}

// Create singleton instance
export const resourcePreloader = new ResourcePreloader();

// Auto-initialize when module is imported
if (typeof window !== 'undefined') {
  // Wait a bit for the app to initialize
  setTimeout(() => {
    resourcePreloader.init();
  }, 1000);
}