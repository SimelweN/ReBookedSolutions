// Performance monitoring utilities for optimization

export const measurePerformance = (name: string, fn: () => void) => {
  if (import.meta.env.DEV) {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`⚡ ${name} took ${(end - start).toFixed(2)}ms`);
  } else {
    fn();
  }
};

export const measureAsyncPerformance = async <T>(
  name: string,
  fn: () => Promise<T>,
): Promise<T> => {
  if (import.meta.env.DEV) {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    console.log(`⚡ ${name} took ${(end - start).toFixed(2)}ms`);
    return result;
  } else {
    return await fn();
  }
};

// Debounce function for performance optimization
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle function for performance optimization
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let isThrottled = false;

  return (...args: Parameters<T>) => {
    if (!isThrottled) {
      func(...args);
      isThrottled = true;
      setTimeout(() => {
        isThrottled = false;
      }, delay);
    }
  };
};

// Intersection Observer hook for lazy loading
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit,
) => {
  if (typeof window === "undefined") return null;

  return new IntersectionObserver(callback, {
    rootMargin: "50px",
    threshold: 0.1,
    ...options,
  });
};

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// Optimize images for better performance
export const optimizeImageSrc = (
  src: string,
  width?: number,
  height?: number,
): string => {
  // If it's already a CDN URL with optimization, return as-is
  if (src.includes("cdn.builder.io") || src.includes("format=webp")) {
    return src;
  }

  // For Builder.io images, add optimization parameters
  if (src.includes("cdn.builder.io")) {
    const url = new URL(src);
    url.searchParams.set("format", "webp");
    if (width) url.searchParams.set("width", width.toString());
    if (height) url.searchParams.set("height", height.toString());
    return url.toString();
  }

  return src;
};

// Memory usage tracking (development only)
export const trackMemoryUsage = (label: string) => {
  if (import.meta.env.DEV && "memory" in performance) {
    const memory = (performance as any).memory;
    console.log(`🧠 Memory (${label}):`, {
      used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)}MB`,
      total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)}MB`,
      limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)}MB`,
    });
  }
};

// Bundle size analysis helper
export const logBundleInfo = () => {
  if (import.meta.env.DEV) {
    console.log("📦 Bundle Info:", {
      mode: import.meta.env.MODE,
      dev: import.meta.env.DEV,
      ssr: import.meta.env.SSR,
    });
  }
};
