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