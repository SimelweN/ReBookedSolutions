/**
 * Third-party Script Error Handler
 * Prevents errors from external scripts from breaking the React application
 */

export class ThirdPartyErrorHandler {
  private static initialized = false;

  /**
   * Initialize error handling for third-party scripts
   */
  static initialize() {
    if (this.initialized || typeof window === "undefined") return;

    // Handle global errors
    window.addEventListener("error", this.handleGlobalError, { passive: true });

    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", this.handlePromiseRejection, {
      passive: true,
    });

    // Override console.error to filter third-party noise
    this.setupConsoleFiltering();

    // Handle Vercel Live script errors specifically
    this.handleVercelLiveErrors();

    this.initialized = true;
    console.log("✅ Third-party error handler initialized");
  }

  /**
   * Handle global JavaScript errors
   */
  private static handleGlobalError = (event: ErrorEvent) => {
    const { message, filename, stack } = event;

    // Ignore third-party script errors that don't affect our app
    if (this.isThirdPartyError(filename, message, stack)) {
      console.debug("🔇 Suppressed third-party error:", {
        message: message.substring(0, 100),
        source: filename,
      });
      event.preventDefault();
      return false;
    }

    // Let app errors through
    return true;
  };

  /**
   * Handle unhandled promise rejections
   */
  private static handlePromiseRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason?.toString() || "";

    if (this.isThirdPartyError("", reason, reason)) {
      console.debug(
        "🔇 Suppressed third-party promise rejection:",
        reason.substring(0, 100),
      );
      event.preventDefault();
    }
  };

  /**
   * Check if error is from third-party source
   */
  private static isThirdPartyError(
    filename?: string,
    message?: string,
    stack?: string,
  ): boolean {
    const thirdPartyIndicators = [
      // Vercel Live
      "vercel.live",
      "feedback.js",
      "_next-live",

      // Analytics
      "google-analytics",
      "googletagmanager",
      "gtag",
      "datadog",
      "vitals.vercel",

      // Other tracking
      "fullstory",
      "hotjar",
      "mixpanel",

      // Known harmless errors
      "Cannot read properties of undefined (reading 'createContext')",
      "Non-Error promise rejection captured",
      "Script error.",
      "ResizeObserver loop limit exceeded",
    ];

    const content =
      `${filename || ""} ${message || ""} ${stack || ""}`.toLowerCase();

    return thirdPartyIndicators.some((indicator) =>
      content.includes(indicator.toLowerCase()),
    );
  }

  /**
   * Setup console filtering to reduce noise
   */
  private static setupConsoleFiltering() {
    const originalError = console.error;

    console.error = (...args: any[]) => {
      const message = args.join(" ");

      if (this.isThirdPartyError("", message, "")) {
        // Still log in debug mode, but less prominently
        console.debug("🔇 Third-party error:", ...args);
        return;
      }

      // Call original console.error for app errors
      originalError.apply(console, args);
    };
  }

  /**
   * Handle Vercel Live specific errors
   */
  private static handleVercelLiveErrors() {
    // Ensure React is available globally for Vercel Live if needed
    if (typeof window !== "undefined" && !window.React) {
      import("react")
        .then((React) => {
          (window as any).React = React;
        })
        .catch(() => {
          // Fail silently - this is just for third-party compatibility
        });
    }
  }

  /**
   * Handle analytics script errors
   */
  private static handleAnalyticsErrors() {
    // Provide fallback for gtag if it fails to load
    if (typeof window !== "undefined" && !window.gtag) {
      (window as any).gtag = (...args: any[]) => {
        console.debug("📊 Analytics call (gtag unavailable):", args[0]);
      };
    }

    // Handle Datadog storage issues
    this.handleDatadogStorageIssues();
  }

  /**
   * Handle Datadog storage issues specifically
   */
  private static handleDatadogStorageIssues() {
    // Override Storage methods to handle quota exceeded errors
    const originalSetItem = Storage.prototype.setItem;

    Storage.prototype.setItem = function (key: string, value: string) {
      try {
        originalSetItem.call(this, key, value);
      } catch (error: any) {
        // Handle quota exceeded errors silently for third-party scripts
        if (error.name === "QuotaExceededError" || error.code === 22) {
          console.debug("🔇 Storage quota exceeded for third-party script");
          return;
        }
        throw error;
      }
    };
  }

  /**
   * Cleanup event listeners
   */
  static cleanup() {
    if (!this.initialized) return;

    window.removeEventListener("error", this.handleGlobalError);
    window.removeEventListener(
      "unhandledrejection",
      this.handlePromiseRejection,
    );

    this.initialized = false;
  }
}

// Auto-initialize in browser environment
if (typeof window !== "undefined") {
  // Use setTimeout to ensure this runs after React is loaded
  setTimeout(() => {
    ThirdPartyErrorHandler.initialize();
  }, 0);
}

export default ThirdPartyErrorHandler;
