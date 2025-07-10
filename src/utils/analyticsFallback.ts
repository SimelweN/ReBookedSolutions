/**
 * Analytics Fallback
 * Provides fallback functions when analytics scripts are blocked
 */

export class AnalyticsFallback {
  private static initialized = false;
  private static queue: any[] = [];

  /**
   * Initialize analytics fallback
   */
  static initialize(): void {
    if (this.initialized || typeof window === "undefined") return;

    // Setup gtag fallback
    this.setupGtagFallback();

    // Setup dataLayer fallback
    this.setupDataLayerFallback();

    // Setup other analytics fallbacks
    this.setupGeneralAnalyticsFallbacks();

    this.initialized = true;
    console.log("📊 Analytics fallback initialized");
  }

  /**
   * Setup gtag fallback function
   */
  private static setupGtagFallback(): void {
    // Only create fallback if gtag doesn't exist
    if (!(window as any).gtag) {
      (window as any).gtag = (...args: any[]) => {
        // Queue the call for when/if gtag loads
        this.queue.push(["gtag", ...args]);

        // Log in development mode
        if (import.meta.env.DEV) {
          console.debug("📊 gtag call (fallback):", args);
        }
      };

      console.debug("📊 gtag fallback created");
    }

    // Check periodically if real gtag loaded and process queue
    this.processQueueWhenReady();
  }

  /**
   * Setup dataLayer fallback
   */
  private static setupDataLayerFallback(): void {
    if (!(window as any).dataLayer) {
      (window as any).dataLayer = [];
      console.debug("📊 dataLayer fallback created");
    }
  }

  /**
   * Setup other analytics fallbacks
   */
  private static setupGeneralAnalyticsFallbacks(): void {
    // Facebook Pixel fallback
    if (!(window as any).fbq) {
      (window as any).fbq = (...args: any[]) => {
        this.queue.push(["fbq", ...args]);
        if (import.meta.env.DEV) {
          console.debug("📊 fbq call (fallback):", args);
        }
      };
    }

    // General analytics fallback
    if (!(window as any).analytics) {
      (window as any).analytics = {
        track: (...args: any[]) => {
          this.queue.push(["analytics.track", ...args]);
          if (import.meta.env.DEV) {
            console.debug("📊 analytics.track call (fallback):", args);
          }
        },
        page: (...args: any[]) => {
          this.queue.push(["analytics.page", ...args]);
          if (import.meta.env.DEV) {
            console.debug("📊 analytics.page call (fallback):", args);
          }
        },
        identify: (...args: any[]) => {
          this.queue.push(["analytics.identify", ...args]);
          if (import.meta.env.DEV) {
            console.debug("📊 analytics.identify call (fallback):", args);
          }
        },
      };
    }
  }

  /**
   * Process queued calls when real analytics loads
   */
  private static processQueueWhenReady(): void {
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds

    const checkInterval = setInterval(() => {
      attempts++;

      if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.debug("📊 Analytics timeout, keeping fallback functions");
        return;
      }

      // Check if gtag is now available (and not our fallback)
      const gtag = (window as any).gtag;
      const dataLayer = (window as any).dataLayer;

      if (
        gtag &&
        typeof gtag === "function" &&
        dataLayer &&
        Array.isArray(dataLayer)
      ) {
        // Try to detect if it's the real gtag
        const testCall = () => {
          try {
            gtag("config", "test");
            return dataLayer.length > 0; // Real gtag would push to dataLayer
          } catch {
            return false;
          }
        };

        if (testCall()) {
          console.log("📊 Real gtag detected, processing queued calls");
          this.processQueue();
          clearInterval(checkInterval);
        }
      }
    }, 1000);
  }

  /**
   * Process queued analytics calls
   */
  private static processQueue(): void {
    const processedCount = this.queue.length;

    while (this.queue.length > 0) {
      const call = this.queue.shift();
      if (!call) continue;

      try {
        const [method, ...args] = call;

        switch (method) {
          case "gtag":
            if ((window as any).gtag) {
              (window as any).gtag(...args);
            }
            break;
          case "fbq":
            if ((window as any).fbq) {
              (window as any).fbq(...args);
            }
            break;
          case "analytics.track":
            if ((window as any).analytics?.track) {
              (window as any).analytics.track(...args);
            }
            break;
          case "analytics.page":
            if ((window as any).analytics?.page) {
              (window as any).analytics.page(...args);
            }
            break;
          case "analytics.identify":
            if ((window as any).analytics?.identify) {
              (window as any).analytics.identify(...args);
            }
            break;
        }
      } catch (error) {
        console.debug("📊 Failed to process queued analytics call:", error);
      }
    }

    if (processedCount > 0) {
      console.log(`📊 Processed ${processedCount} queued analytics calls`);
    }
  }

  /**
   * Track page view with fallback
   */
  static trackPageView(path: string, title?: string): void {
    if (typeof window === "undefined") return;

    // Try gtag
    if ((window as any).gtag) {
      (window as any).gtag("config", "G-33V40Q5BEW", {
        page_path: path,
        page_title: title,
      });
    }

    // Try general analytics
    if ((window as any).analytics) {
      (window as any).analytics.page(path, {
        title: title || document.title,
        path,
      });
    }

    // Debug log
    if (import.meta.env.DEV) {
      console.debug("📊 Page view tracked:", { path, title });
    }
  }

  /**
   * Track event with fallback
   */
  static trackEvent(
    action: string,
    category?: string,
    label?: string,
    value?: number,
  ): void {
    if (typeof window === "undefined") return;

    // Try gtag
    if ((window as any).gtag) {
      (window as any).gtag("event", action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }

    // Try general analytics
    if ((window as any).analytics) {
      (window as any).analytics.track(action, {
        category,
        label,
        value,
      });
    }

    // Debug log
    if (import.meta.env.DEV) {
      console.debug("📊 Event tracked:", { action, category, label, value });
    }
  }

  /**
   * Get analytics status
   */
  static getStatus(): { gtag: boolean; dataLayer: boolean; queue: number } {
    return {
      gtag: typeof (window as any).gtag === "function",
      dataLayer: Array.isArray((window as any).dataLayer),
      queue: this.queue.length,
    };
  }
}

// Auto-initialize
if (typeof window !== "undefined") {
  // Initialize after a brief delay to allow other scripts to load
  setTimeout(() => {
    AnalyticsFallback.initialize();
  }, 100);
}

export default AnalyticsFallback;
