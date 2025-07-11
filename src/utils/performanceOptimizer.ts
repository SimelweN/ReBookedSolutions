/**
 * Performance optimization utilities to reduce lag and improve responsiveness
 */

// Debounce function to reduce excessive API calls
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function to limit function calls
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Clean up unused event listeners
export const cleanupEventListeners = () => {
  if (typeof window === "undefined") return;

  // Remove duplicate scroll listeners
  const events = ["scroll", "resize", "mousemove"];
  events.forEach((event) => {
    const listeners = (window as any)[`_${event}Listeners`] || [];
    listeners.forEach((listener: any) => {
      try {
        window.removeEventListener(event, listener);
      } catch (e) {
        // Ignore errors
      }
    });
  });
};

// Optimize images by reducing quality for performance
export const optimizeImages = () => {
  if (typeof document === "undefined") return;

  const images = document.querySelectorAll("img");
  images.forEach((img) => {
    if (!img.loading) {
      img.loading = "lazy";
    }
    // Add error handling
    img.onerror = () => {
      img.style.display = "none";
    };
  });
};

// Clear unnecessary localStorage items
export const cleanupStorage = () => {
  if (typeof localStorage === "undefined") return;

  const keysToKeep = [
    "sb-access-token",
    "sb-refresh-token",
    "theme",
    "last_welcome_",
  ];

  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && !keysToKeep.some((keepKey) => key.startsWith(keepKey))) {
      localStorage.removeItem(key);
    }
  }
};

// Reduce DOM reflows by batching operations
export const batchDOMOperations = (operations: (() => void)[]) => {
  if (typeof requestAnimationFrame === "undefined") {
    // Fallback for environments without requestAnimationFrame
    setTimeout(() => {
      operations.forEach((op) => {
        try {
          op();
        } catch (e) {
          console.warn("DOM operation failed:", e);
        }
      });
    }, 0);
    return;
  }

  requestAnimationFrame(() => {
    operations.forEach((op) => {
      try {
        op();
      } catch (e) {
        console.warn("DOM operation failed:", e);
      }
    });
  });
};

// Initialize performance optimizations
export const initPerformanceOptimizations = () => {
  if (typeof window === "undefined") return;

  // Clean up on page load
  cleanupEventListeners();
  cleanupStorage();

  // Optimize images after load
  if (document.readyState === "complete") {
    optimizeImages();
  } else {
    window.addEventListener("load", optimizeImages);
  }

  // Periodic cleanup
  setInterval(() => {
    cleanupStorage();
    optimizeImages();
  }, 300000); // Every 5 minutes

  console.log("✅ Performance optimizations initialized");
};
