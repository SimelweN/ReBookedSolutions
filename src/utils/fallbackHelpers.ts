/**
 * Comprehensive fallback utilities for better user experience
 */

// Image fallback handler
export const handleImageError = (
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackSrc?: string,
) => {
  const target = event.currentTarget;
  const defaultFallback = "/placeholder.svg";

  if (target.src !== defaultFallback && target.src !== fallbackSrc) {
    // Try provided fallback first, then default
    target.src = fallbackSrc || defaultFallback;
  } else if (!target.dataset.fallbackShown) {
    // If both original and fallback failed, show icon
    target.style.display = "none";
    target.dataset.fallbackShown = "true";

    const parent = target.parentElement;
    if (parent && !parent.querySelector(".img-fallback")) {
      const fallback = document.createElement("div");
      fallback.className =
        "img-fallback w-full h-full bg-gray-200 flex items-center justify-center rounded";
      fallback.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="text-gray-400">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21,15 16,10 5,21"/>
        </svg>
      `;
      parent.appendChild(fallback);
    }
  }
};

// Profile image fallback handler
export const handleProfileImageError = (
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  className: string = "w-5 h-5",
) => {
  const target = event.currentTarget;
  target.style.display = "none";

  const parent = target.parentElement;
  if (parent && !parent.querySelector(".fallback-icon")) {
    const fallbackIcon = document.createElement("div");
    fallbackIcon.className = `fallback-icon ${className}`;
    fallbackIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    `;
    parent.appendChild(fallbackIcon);
  }
};

// Network status checker
export const isOnline = (): boolean => {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
};

// Retry with exponential backoff
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Max retries exceeded");
};

// Local storage with fallback
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
};

// Session storage with fallback
export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      sessionStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
};

// CSS feature detection
export const supportsFeature = {
  webp: (): Promise<boolean> => {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src =
        "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
    });
  },

  intersectionObserver: (): boolean => {
    return "IntersectionObserver" in window;
  },

  requestIdleCallback: (): boolean => {
    return "requestIdleCallback" in window;
  },

  serviceWorker: (): boolean => {
    return "serviceWorker" in navigator;
  },
};

// Graceful error handling for async operations
export const withFallback = async <T>(
  asyncFn: () => Promise<T>,
  fallbackValue: T,
  onError?: (error: Error) => void,
): Promise<T> => {
  try {
    return await asyncFn();
  } catch (error) {
    if (onError && error instanceof Error) {
      onError(error);
    }
    return fallbackValue;
  }
};

// Environment-specific fallbacks
export const getEnvironmentConfig = () => {
  const isDev = import.meta.env.DEV;
  const isProd = import.meta.env.PROD;

  return {
    isDev,
    isProd,
    apiUrl:
      import.meta.env.VITE_APP_URL ||
      (isDev ? "http://localhost:3000" : "https://api.rebooked.co.za"),
    enableErrorReporting: isProd,
    enableDebugLogs: isDev,
    enableServiceWorker: isProd,
  };
};

// URL validation and fallback
export const getSafeUrl = (
  url: string,
  fallback: string = "/placeholder.svg",
): string => {
  try {
    new URL(url);
    return url;
  } catch {
    return fallback;
  }
};

// Text truncation with fallback
export const truncateText = (
  text: string,
  maxLength: number,
  suffix: string = "...",
): string => {
  if (!text || typeof text !== "string") return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

// Safe JSON parsing
export const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
};

// Debounced function with fallback
export const createDebouncedFunction = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  immediate: boolean = false,
): T => {
  let timeoutId: NodeJS.Timeout | null = null;

  return ((...args: Parameters<T>) => {
    const callNow = immediate && !timeoutId;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (!immediate) func(...args);
    }, delay);

    if (callNow) func(...args);
  }) as T;
};
