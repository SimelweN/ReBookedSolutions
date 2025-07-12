/**
 * Safe ResizeObserver wrapper that prevents infinite loops
 * and provides debouncing to improve performance
 */

import React from "react";

interface DebouncedResizeObserverOptions {
  debounceTime?: number;
  maxCallsPerSecond?: number;
}

export class SafeResizeObserver {
  private observer: ResizeObserver | null = null;
  private callbacks = new Map<Element, ResizeObserverCallback>();
  private debounceTimers = new Map<Element, NodeJS.Timeout>();
  private callCounts = new Map<Element, { count: number; timestamp: number }>();

  private debounceTime: number;
  private maxCallsPerSecond: number;

  constructor(options: DebouncedResizeObserverOptions = {}) {
    this.debounceTime = options.debounceTime || 16; // ~60fps
    this.maxCallsPerSecond = options.maxCallsPerSecond || 30;

    try {
      this.observer = new ResizeObserver(this.handleResize.bind(this));
    } catch (error) {
      console.warn("ResizeObserver not supported:", error);
    }
  }

  private handleResize(entries: ResizeObserverEntry[]) {
    entries.forEach((entry) => {
      const element = entry.target;
      const callback = this.callbacks.get(element);

      if (!callback) return;

      // Rate limiting to prevent excessive calls
      const now = Date.now();
      const callData = this.callCounts.get(element) || {
        count: 0,
        timestamp: now,
      };

      // Reset count if more than a second has passed
      if (now - callData.timestamp > 1000) {
        callData.count = 0;
        callData.timestamp = now;
      }

      // Skip if we've exceeded the call limit
      if (callData.count >= this.maxCallsPerSecond) {
        return;
      }

      callData.count++;
      this.callCounts.set(element, callData);

      // Debounce the callback
      const existingTimer = this.debounceTimers.get(element);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(() => {
        try {
          // Wrap in requestAnimationFrame to prevent layout thrashing
          requestAnimationFrame(() => {
            try {
              callback([entry], this.observer!);
            } catch (error) {
              // Silently handle callback errors to prevent crashes
              if (import.meta.env.DEV) {
                console.debug("ResizeObserver callback error:", error);
              }
            }
          });
        } catch (error) {
          if (import.meta.env.DEV) {
            console.debug("ResizeObserver RAF error:", error);
          }
        }

        this.debounceTimers.delete(element);
      }, this.debounceTime);

      this.debounceTimers.set(element, timer);
    });
  }

  observe(element: Element, callback: ResizeObserverCallback) {
    if (!this.observer) {
      console.warn("ResizeObserver not available");
      return;
    }

    try {
      this.callbacks.set(element, callback);
      this.observer.observe(element);
    } catch (error) {
      console.warn("Failed to observe element:", error);
    }
  }

  unobserve(element: Element) {
    if (!this.observer) return;

    try {
      this.observer.unobserve(element);
      this.callbacks.delete(element);

      // Clean up timers and counters
      const timer = this.debounceTimers.get(element);
      if (timer) {
        clearTimeout(timer);
        this.debounceTimers.delete(element);
      }

      this.callCounts.delete(element);
    } catch (error) {
      console.warn("Failed to unobserve element:", error);
    }
  }

  disconnect() {
    if (!this.observer) return;

    try {
      this.observer.disconnect();

      // Clean up all timers
      this.debounceTimers.forEach((timer) => clearTimeout(timer));
      this.debounceTimers.clear();
      this.callbacks.clear();
      this.callCounts.clear();
    } catch (error) {
      console.warn("Failed to disconnect ResizeObserver:", error);
    }
  }
}

// Create a singleton instance for general use
export const safeResizeObserver = new SafeResizeObserver();

// Hook for React components
export const useSafeResizeObserver = (
  callback: ResizeObserverCallback,
  options?: DebouncedResizeObserverOptions,
) => {
  const observerRef = React.useRef<SafeResizeObserver | null>(null);

  React.useEffect(() => {
    observerRef.current = new SafeResizeObserver(options);

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const observe = React.useCallback(
    (element: Element) => {
      observerRef.current?.observe(element, callback);
    },
    [callback],
  );

  const unobserve = React.useCallback((element: Element) => {
    observerRef.current?.unobserve(element);
  }, []);

  return { observe, unobserve };
};

// Export for external use
export default SafeResizeObserver;
