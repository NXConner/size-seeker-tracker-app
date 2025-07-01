// Performance optimization utilities

// Debounce utility
export const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle utility
export const useThrottle = (value: any, delay: number) => {
  const [throttledValue, setThrottledValue] = React.useState(value);
  const lastRan = React.useRef(Date.now());

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= delay) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, delay - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return throttledValue;
};

// LRU Cache implementation
export class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, V>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      const value = this.cache.get(key)!;
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  put(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Image cache for performance
export const imageCache = new LRUCache<string, string>(50);

// Memoization utility for expensive calculations
export const memoize = <T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// Virtual scrolling utilities
export const useVirtualScrolling = (
  items: any[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount + 1, items.length);

  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
  };
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, options]);

  return isIntersecting;
};

// Performance monitoring utilities
export const performanceMonitor = {
  marks: new Map<string, number>(),

  start(label: string): void {
    this.marks.set(label, performance.now());
  },

  end(label: string): number {
    const startTime = this.marks.get(label);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.marks.delete(label);
      console.log(`${label}: ${duration.toFixed(2)}ms`);
      return duration;
    }
    return 0;
  },

  measure(label: string, fn: () => any): any {
    this.start(label);
    const result = fn();
    this.end(label);
    return result;
  },

  async measureAsync(label: string, fn: () => Promise<any>): Promise<any> {
    this.start(label);
    const result = await fn();
    this.end(label);
    return result;
  }
};

// Core Web Vitals monitoring
export const coreWebVitals = {
  // Largest Contentful Paint
  lcp: {
    value: 0,
    observer: null as PerformanceObserver | null,
    
    start() {
      if ('PerformanceObserver' in window) {
        this.observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.value = lastEntry.startTime;
          console.log('LCP:', this.value);
        });
        this.observer.observe({ entryTypes: ['largest-contentful-paint'] });
      }
    },
    
    stop() {
      if (this.observer) {
        this.observer.disconnect();
      }
    }
  },

  // First Input Delay
  fid: {
    value: 0,
    observer: null as PerformanceObserver | null,
    
    start() {
      if ('PerformanceObserver' in window) {
        this.observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.value = entry.processingStart - entry.startTime;
            console.log('FID:', this.value);
          });
        });
        this.observer.observe({ entryTypes: ['first-input'] });
      }
    },
    
    stop() {
      if (this.observer) {
        this.observer.disconnect();
      }
    }
  },

  // Cumulative Layout Shift
  cls: {
    value: 0,
    observer: null as PerformanceObserver | null,
    
    start() {
      if ('PerformanceObserver' in window) {
        this.observer = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          this.value = clsValue;
          console.log('CLS:', this.value);
        });
        this.observer.observe({ entryTypes: ['layout-shift'] });
      }
    },
    
    stop() {
      if (this.observer) {
        this.observer.disconnect();
      }
    }
  },

  // Start monitoring all Core Web Vitals
  startMonitoring() {
    this.lcp.start();
    this.fid.start();
    this.cls.start();
  },

  // Stop monitoring all Core Web Vitals
  stopMonitoring() {
    this.lcp.stop();
    this.fid.stop();
    this.cls.stop();
  },

  // Get all metrics
  getMetrics() {
    return {
      lcp: this.lcp.value,
      fid: this.fid.value,
      cls: this.cls.value
    };
  }
};

// Memory leak detection
export const memoryLeakDetector = {
  snapshots: [] as Array<{ timestamp: number; memory: any }>,
  interval: null as NodeJS.Timeout | null,
  
  start(intervalMs: number = 5000) {
    this.interval = setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.snapshots.push({
          timestamp: Date.now(),
          memory: {
            used: memory.usedJSHeapSize,
            total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit
          }
        });
        
        // Keep only last 20 snapshots
        if (this.snapshots.length > 20) {
          this.snapshots.shift();
        }
        
        // Check for potential memory leaks
        this.detectLeaks();
      }
    }, intervalMs);
  },
  
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  },
  
  detectLeaks() {
    if (this.snapshots.length < 5) return;
    
    const recent = this.snapshots.slice(-5);
    const first = recent[0];
    const last = recent[recent.length - 1];
    
    const growthRate = (last.memory.used - first.memory.used) / 
                      (last.timestamp - first.timestamp);
    
    if (growthRate > 1000) { // 1KB per second growth
      console.warn('Potential memory leak detected:', {
        growthRate: `${(growthRate / 1024).toFixed(2)}KB/s`,
        currentUsage: `${(last.memory.used / 1024 / 1024).toFixed(2)}MB`
      });
    }
  },
  
  getMemoryTrend() {
    if (this.snapshots.length < 2) return null;
    
    const first = this.snapshots[0];
    const last = this.snapshots[this.snapshots.length - 1];
    
    return {
      start: first.memory.used,
      end: last.memory.used,
      growth: last.memory.used - first.memory.used,
      growthRate: (last.memory.used - first.memory.used) / 
                  (last.timestamp - first.timestamp)
    };
  }
};

// Web Worker utilities for heavy computations
export class WorkerPool {
  private workers: Worker[] = [];
  private queue: Array<{ id: string; task: any; resolve: Function; reject: Function }> = [];
  private activeWorkers = new Map<string, Worker>();

  constructor(workerScript: string, poolSize: number = navigator.hardwareConcurrency || 4) {
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(workerScript);
      worker.onmessage = (e) => this.handleWorkerMessage(e);
      this.workers.push(worker);
    }
  }

  private handleWorkerMessage(e: MessageEvent) {
    const { id, result, error } = e.data;
    const task = this.activeWorkers.get(id);
    
    if (task) {
      this.activeWorkers.delete(id);
      this.workers.push(task);
      this.processQueue();
    }

    const queuedTask = this.queue.find(t => t.id === id);
    if (queuedTask) {
      if (error) {
        queuedTask.reject(error);
      } else {
        queuedTask.resolve(result);
      }
      this.queue = this.queue.filter(t => t.id !== id);
    }
  }

  private processQueue() {
    if (this.queue.length === 0 || this.workers.length === 0) return;

    const task = this.queue.shift()!;
    const worker = this.workers.pop()!;
    
    this.activeWorkers.set(task.id, worker);
    worker.postMessage(task.task);
  }

  async execute(task: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substr(2, 9);
      this.queue.push({ id, task, resolve, reject });
      this.processQueue();
    });
  }

  terminate() {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.activeWorkers.clear();
    this.queue = [];
  }
}

// React performance optimizations
export const withPerformanceOptimization = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    memo?: boolean;
    shouldComponentUpdate?: (prevProps: P, nextProps: P) => boolean;
  } = {}
) => {
  let OptimizedComponent = Component;

  if (options.memo !== false) {
    OptimizedComponent = React.memo(Component, options.shouldComponentUpdate);
  }

  return OptimizedComponent;
};

// Bundle size optimization utilities
export const lazyLoad = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) => {
  const LazyComponent = React.lazy(importFunc);
  
  return (props: React.ComponentProps<T>) => (
    <React.Suspense fallback={fallback ? <fallback /> : <div>Loading...</div>}>
      <LazyComponent {...props} />
    </React.Suspense>
  );
};

// Memory management utilities
export const memoryManager = {
  // Clear unused caches
  cleanup(): void {
    imageCache.clear();
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('image-cache')) {
            caches.delete(name);
          }
        });
      });
    }
  },

  // Monitor memory usage
  getMemoryInfo(): { used: number; total: number; limit: number } | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
    }
    return null;
  },

  // Check if memory usage is high
  isMemoryHigh(threshold: number = 0.8): boolean {
    const memoryInfo = this.getMemoryInfo();
    if (!memoryInfo) return false;
    
    return memoryInfo.used / memoryInfo.limit > threshold;
  }
};

// Export React for use in utilities
import React from 'react'; 