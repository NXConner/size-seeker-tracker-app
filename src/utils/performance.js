"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryManager = exports.lazyLoad = exports.withPerformanceOptimization = exports.WorkerPool = exports.memoryLeakDetector = exports.coreWebVitals = exports.performanceMonitor = exports.useIntersectionObserver = exports.useVirtualScrolling = exports.memoize = exports.imageCache = exports.LRUCache = exports.useThrottle = exports.useDebounce = void 0;
const react_1 = __importDefault(require("react"));
// Performance optimization utilities
// Debounce utility
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = react_1.default.useState(value);
    react_1.default.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};
exports.useDebounce = useDebounce;
// Throttle utility
const useThrottle = (value, delay) => {
    const [throttledValue, setThrottledValue] = react_1.default.useState(value);
    const lastRan = react_1.default.useRef(Date.now());
    react_1.default.useEffect(() => {
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
exports.useThrottle = useThrottle;
// LRU Cache implementation
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
    }
    get(key) {
        if (this.cache.has(key)) {
            const value = this.cache.get(key);
            this.cache.delete(key);
            this.cache.set(key, value);
            return value;
        }
        return undefined;
    }
    put(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        else if (this.cache.size >= this.capacity) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }
    clear() {
        this.cache.clear();
    }
    size() {
        return this.cache.size;
    }
}
exports.LRUCache = LRUCache;
// Image cache for performance
exports.imageCache = new LRUCache(50);
// Memoization utility for expensive calculations
const memoize = (fn, getKey) => {
    const cache = new Map();
    return ((...args) => {
        const key = getKey ? getKey(...args) : JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn(...args);
        cache.set(key, result);
        return result;
    });
};
exports.memoize = memoize;
// Virtual scrolling utilities
const useVirtualScrolling = (items, itemHeight, containerHeight) => {
    const [scrollTop, setScrollTop] = react_1.default.useState(0);
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
exports.useVirtualScrolling = useVirtualScrolling;
// Intersection Observer hook for lazy loading
const useIntersectionObserver = (ref, options = {}) => {
    const [isIntersecting, setIsIntersecting] = react_1.default.useState(false);
    react_1.default.useEffect(() => {
        const element = ref.current;
        if (!element)
            return;
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
exports.useIntersectionObserver = useIntersectionObserver;
// Performance monitoring utilities
exports.performanceMonitor = {
    marks: new Map(),
    start(label) {
        this.marks.set(label, performance.now());
    },
    end(label) {
        const startTime = this.marks.get(label);
        if (startTime) {
            const duration = performance.now() - startTime;
            this.marks.delete(label);
            console.log(`${label}: ${duration.toFixed(2)}ms`);
            return duration;
        }
        return 0;
    },
    measure(label, fn) {
        this.start(label);
        const result = fn();
        this.end(label);
        return result;
    },
    async measureAsync(label, fn) {
        this.start(label);
        const result = await fn();
        this.end(label);
        return result;
    }
};
// Core Web Vitals monitoring
exports.coreWebVitals = {
    // Largest Contentful Paint
    lcp: {
        value: 0,
        observer: null,
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
        observer: null,
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
        observer: null,
        start() {
            if ('PerformanceObserver' in window) {
                this.observer = new PerformanceObserver((list) => {
                    let clsValue = 0;
                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
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
exports.memoryLeakDetector = {
    snapshots: [],
    interval: null,
    start(intervalMs = 5000) {
        this.interval = setInterval(() => {
            if ('memory' in performance) {
                const memory = performance.memory;
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
        if (this.snapshots.length < 5)
            return;
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
        if (this.snapshots.length < 2)
            return null;
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
class WorkerPool {
    constructor(workerScript, poolSize = navigator.hardwareConcurrency || 4) {
        this.workers = [];
        this.queue = [];
        this.activeWorkers = new Map();
        for (let i = 0; i < poolSize; i++) {
            const worker = new Worker(workerScript);
            worker.onmessage = (e) => this.handleWorkerMessage(e);
            this.workers.push(worker);
        }
    }
    handleWorkerMessage(e) {
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
            }
            else {
                queuedTask.resolve(result);
            }
            this.queue = this.queue.filter(t => t.id !== id);
        }
    }
    processQueue() {
        if (this.queue.length === 0 || this.workers.length === 0)
            return;
        const task = this.queue.shift();
        const worker = this.workers.pop();
        this.activeWorkers.set(task.id, worker);
        worker.postMessage(task.task);
    }
    async execute(task) {
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
exports.WorkerPool = WorkerPool;
// React performance optimizations
const withPerformanceOptimization = (Component, options = {}) => {
    let OptimizedComponent = Component;
    if (options.memo !== false) {
        OptimizedComponent = react_1.default.memo(Component, options.shouldComponentUpdate);
    }
    return OptimizedComponent;
};
exports.withPerformanceOptimization = withPerformanceOptimization;
// Bundle size optimization utilities
const lazyLoad = (importFunc, fallback) => {
    const LazyComponent = react_1.default.lazy(importFunc);
    return (props) => {
        const Fallback = fallback;
        const fallbackNode = Fallback ? react_1.default.createElement(Fallback) : react_1.default.createElement('div', null, 'Loading...');
        return react_1.default.createElement(react_1.default.Suspense, { fallback: fallbackNode }, react_1.default.createElement(LazyComponent, { ...props }));
    };
};
exports.lazyLoad = lazyLoad;
// Memory management utilities
exports.memoryManager = {
    // Clear unused caches
    cleanup() {
        exports.imageCache.clear();
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
    getMemoryInfo() {
        if ('memory' in performance) {
            const memory = performance.memory;
            return {
                used: memory.usedJSHeapSize,
                total: memory.totalJSHeapSize,
                limit: memory.jsHeapSizeLimit
            };
        }
        return null;
    },
    // Check if memory usage is high
    isMemoryHigh(threshold = 0.8) {
        const memoryInfo = this.getMemoryInfo();
        if (!memoryInfo)
            return false;
        return memoryInfo.used / memoryInfo.limit > threshold;
    }
};
