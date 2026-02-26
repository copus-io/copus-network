/**
 * 🔍 SEARCH: css-optimizer-system
 * CSS loading optimization for better Critical Rendering Path
 */

interface CSSResource {
  href: string;
  media?: string;
  priority: 'critical' | 'high' | 'low';
  loaded: boolean;
}

class CSSOptimizer {
  private loadedStylesheets: Set<string> = new Set();
  private pendingStyles: CSSResource[] = [];

  /**
   * Load CSS asynchronously to avoid render blocking
   */
  loadStylesheetAsync(href: string, media: string = 'all', priority: 'critical' | 'high' | 'low' = 'low'): Promise<void> {
    return new Promise((resolve, reject) => {
      // Skip if already loaded
      if (this.loadedStylesheets.has(href)) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      link.media = 'print'; // Load as print media to avoid blocking
      link.onload = () => {
        // Switch to the correct media after loading
        link.media = media;
        link.rel = 'stylesheet';
        this.loadedStylesheets.add(href);
        resolve();
      };
      link.onerror = reject;

      // Insert based on priority
      if (priority === 'critical') {
        document.head.insertBefore(link, document.head.firstChild);
      } else {
        document.head.appendChild(link);
      }
    });
  }

  /**
   * Inline critical CSS for above-the-fold content
   */
  inlineCriticalCSS(cssContent: string): void {
    const style = document.createElement('style');
    style.textContent = cssContent;
    style.setAttribute('data-critical', 'true');

    // Insert at the beginning of head for highest priority
    document.head.insertBefore(style, document.head.firstChild);
  }

  /**
   * Extract critical CSS for the current page
   */
  extractCriticalCSS(): string {
    // Define critical CSS that's needed for initial render
    return `
      /* Critical CSS for above-the-fold content */
      .bg-\\[linear-gradient\\(0deg\\2c rgba\\(224\\2c 224\\2c 224\\2c 0\\.18\\)_0\\%\\2c rgba\\(224\\2c 224\\2c 224\\2c 0\\.18\\)_100\\%\\)\\2c linear-gradient\\(0deg\\2c rgba\\(255\\2c 255\\2c 255\\2c 1\\)_0\\%\\2c rgba\\(255\\2c 255\\2c 255\\2c 1\\)_100\\%\\)\\] {
        background: linear-gradient(0deg,rgba(224,224,224,0.18) 0%,rgba(224,224,224,0.18) 100%),linear-gradient(0deg,rgba(255,255,255,1) 0%,rgba(255,255,255,1) 100%);
      }

      /* Critical layout classes */
      .w-full { width: 100%; }
      .min-h-screen { min-height: 100vh; }
      .flex { display: flex; }
      .items-center { align-items: center; }
      .justify-center { justify-content: center; }
      .opacity-0 { opacity: 0; }
      .opacity-100 { opacity: 1; }
      .transition-opacity { transition-property: opacity; }
      .duration-300 { transition-duration: 300ms; }

      /* Header height to prevent layout shift */
      .pt-\\[50px\\] { padding-top: 50px; }

      @media (min-width: 1024px) {
        .lg\\:ml-\\[310px\\] { margin-left: 310px; }
        .lg\\:mr-\\[40px\\] { margin-right: 40px; }
        .lg\\:pt-\\[60px\\] { padding-top: 60px; }
      }
    `;
  }

  /**
   * Optimize font loading
   */
  optimizeFontLoading(): void {
    // Preload critical fonts
    const criticalFonts = [
      // Add any critical fonts here
    ];

    criticalFonts.forEach(fontUrl => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = fontUrl;
      document.head.appendChild(link);
    });

    // Apply font-display: swap to avoid invisible text
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Lato';
        font-display: swap;
      }

      /* Ensure text is visible during webfont load */
      body {
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Defer non-critical CSS loading
   */
  deferNonCriticalCSS(): void {
    // Wait for the page to load before loading non-critical styles
    if (document.readyState === 'complete') {
      this.loadNonCriticalStyles();
    } else {
      window.addEventListener('load', () => {
        this.loadNonCriticalStyles();
      });
    }
  }

  /**
   * Load non-critical styles after page load
   */
  private loadNonCriticalStyles(): void {
    // Load animation and enhancement CSS after main content
    const nonCriticalStyles = [
      // Add any non-critical stylesheets here
    ];

    nonCriticalStyles.forEach(href => {
      this.loadStylesheetAsync(href, 'all', 'low');
    });
  }

  /**
   * Remove unused CSS on the fly
   */
  removeUnusedCSS(): void {
    // This is a simplified version - in production you'd use a tool like PurgeCSS
    const unusedSelectors = [
      // Add selectors that are definitely not used on current page
    ];

    // Find and disable unused style rules (development and test only)
    if (process.env.NODE_ENV !== 'production') {
      unusedSelectors.forEach(selector => {
        const rules = document.styleSheets;
        for (let i = 0; i < rules.length; i++) {
          try {
            const cssRules = rules[i].cssRules || rules[i].rules;
            if (cssRules) {
              for (let j = 0; j < cssRules.length; j++) {
                const rule = cssRules[j] as CSSStyleRule;
                if (rule.selectorText && rule.selectorText.includes(selector)) {
                  rule.style.display = 'none';
                }
              }
            }
          } catch (e) {
            // Cross-origin stylesheets can't be accessed
          }
        }
      });
    }
  }

  /**
   * Initialize CSS optimization
   */
  init(): void {
    if (typeof window === 'undefined') return;

    // Inline critical CSS immediately
    const criticalCSS = this.extractCriticalCSS();
    this.inlineCriticalCSS(criticalCSS);

    // Optimize font loading
    this.optimizeFontLoading();

    // Defer non-critical CSS
    this.deferNonCriticalCSS();

    // Set up performance monitoring
    this.monitorCSSPerformance();
  }

  /**
   * Monitor CSS loading performance
   */
  private monitorCSSPerformance(): void {
    if ('performance' in window && window.performance.getEntriesByType) {
      setTimeout(() => {
        const cssEntries = window.performance.getEntriesByType('resource')
          .filter(entry => entry.name.endsWith('.css'));

        const totalCSSTime = cssEntries.reduce((total, entry) => {
          return total + (entry.responseEnd - entry.startTime);
        }, 0);

        if (process.env.NODE_ENV !== 'production') {
          console.log(`📊 CSS Performance: ${cssEntries.length} stylesheets loaded in ${totalCSSTime.toFixed(2)}ms`);
        }
      }, 2000);
    }
  }

  /**
   * Get CSS optimization statistics
   */
  getStats(): { loaded: number; pending: number; loadTime: number } {
    return {
      loaded: this.loadedStylesheets.size,
      pending: this.pendingStyles.length,
      loadTime: 0 // Would track actual load times in production
    };
  }
}

// Create singleton instance
export const cssOptimizer = new CSSOptimizer();

// Auto-initialize
if (typeof window !== 'undefined') {
  // Initialize as early as possible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      cssOptimizer.init();
    });
  } else {
    cssOptimizer.init();
  }
}