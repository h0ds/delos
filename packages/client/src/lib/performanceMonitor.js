/**
 * Performance monitoring for code splitting and chunk loading
 * Tracks metrics for production analytics
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      chunkLoads: [],
      navigationTimes: [],
      initialPageLoad: null,
      largeChunksLoaded: []
    }
  }

  /**
   * Initialize monitoring with PerformanceObserver
   */
  init() {
    // Monitor resource loading (chunks)
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.name.includes('/assets/chunk-') || entry.name.includes('/assets/vendor-')) {
              const chunkData = {
                name: entry.name.split('/').pop(),
                duration: Math.round(entry.duration),
                size: entry.transferSize,
                type: 'chunk',
                timestamp: Date.now()
              }
              this.metrics.chunkLoads.push(chunkData)

              // Log large chunks (>100KB transferred)
              if (entry.transferSize > 100000) {
                this.metrics.largeChunksLoaded.push(chunkData)
                console.log(
                  `[perf] Large chunk loaded: ${chunkData.name} (${(chunkData.size / 1024).toFixed(1)}KB, ${chunkData.duration.toFixed(0)}ms)`
                )
              }
            }
          }
        })

        observer.observe({ entryTypes: ['resource'] })
      } catch (e) {
        console.warn('[perf] PerformanceObserver not available:', e.message)
      }
    }

    // Record initial page load time
    window.addEventListener('load', () => {
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing
        this.metrics.initialPageLoad = {
          domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
          pageLoad: timing.loadEventEnd - timing.navigationStart,
          firstPaint: timing.responseStart - timing.navigationStart
        }
        console.log('[perf] Initial page load:', {
          domContentLoaded: `${this.metrics.initialPageLoad.domContentLoaded}ms`,
          pageLoad: `${this.metrics.initialPageLoad.pageLoad}ms`
        })
      }
    })
  }

  /**
   * Track navigation between pages (for lazy-loaded components)
   */
  trackNavigation(from, to) {
    const start = performance.now()
    const cleanup = () => {
      const duration = performance.now() - start
      this.metrics.navigationTimes.push({
        from,
        to,
        duration: Math.round(duration),
        timestamp: Date.now()
      })
      if (duration > 200) {
        console.warn(`[perf] Slow navigation: ${from} → ${to} (${duration.toFixed(0)}ms)`)
      } else {
        console.log(`[perf] Navigation: ${from} → ${to} (${duration.toFixed(0)}ms)`)
      }
    }
    return cleanup
  }

  /**
   * Report metrics summary
   */
  report() {
    const summary = {
      totalChunksLoaded: this.metrics.chunkLoads.length,
      largeChunksLoaded: this.metrics.largeChunksLoaded.length,
      totalChunkTime: this.metrics.chunkLoads.reduce((sum, c) => sum + c.duration, 0),
      averageChunkLoadTime:
        this.metrics.chunkLoads.length > 0
          ? Math.round(
              this.metrics.chunkLoads.reduce((sum, c) => sum + c.duration, 0) /
                this.metrics.chunkLoads.length
            )
          : 0,
      navigationCount: this.metrics.navigationTimes.length,
      averageNavigationTime:
        this.metrics.navigationTimes.length > 0
          ? Math.round(
              this.metrics.navigationTimes.reduce((sum, n) => sum + n.duration, 0) /
                this.metrics.navigationTimes.length
            )
          : 0,
      initialPageLoad: this.metrics.initialPageLoad
    }

    console.table({
      'Total Chunks Loaded': summary.totalChunksLoaded,
      'Large Chunks (>100KB)': summary.largeChunksLoaded,
      'Total Chunk Time': `${summary.totalChunkTime}ms`,
      'Avg Chunk Load': `${summary.averageChunkLoadTime}ms`,
      Navigations: summary.navigationCount,
      'Avg Navigation': `${summary.averageNavigationTime}ms`,
      'DOM Ready': this.metrics.initialPageLoad?.domContentLoaded
        ? `${this.metrics.initialPageLoad.domContentLoaded}ms`
        : 'N/A',
      'Page Load': this.metrics.initialPageLoad?.pageLoad
        ? `${this.metrics.initialPageLoad.pageLoad}ms`
        : 'N/A'
    })

    return summary
  }

  /**
   * Get detailed chunk loading report
   */
  getChunkReport() {
    return {
      chunks: this.metrics.chunkLoads.sort((a, b) => b.size - a.size),
      largeChunks: this.metrics.largeChunksLoaded,
      totalSize: this.metrics.chunkLoads.reduce((sum, c) => sum + c.size, 0),
      totalTime: this.metrics.chunkLoads.reduce((sum, c) => sum + c.duration, 0)
    }
  }
}

// Create singleton instance
export const perfMonitor = new PerformanceMonitor()

// Auto-initialize if running in production
if (import.meta.env.PROD) {
  perfMonitor.init()
}
