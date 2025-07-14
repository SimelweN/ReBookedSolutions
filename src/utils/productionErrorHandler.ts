/**
 * Production-safe error handling utilities
 * Designed to prevent Vercel deployment errors and optimize performance
 */

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export class ProductionErrorHandler {
  private static isProduction = import.meta.env.PROD;
  private static isDevelopment = import.meta.env.DEV;

  /**
   * Safe error logging that won't cause deployment issues
   */
  static logError(error: unknown, context?: ErrorContext): void {
    // Only log detailed errors in development
    if (this.isDevelopment) {
      this.devLog(error, context);
    } else {
      // Production: minimal, safe logging
      this.prodLog(error, context);
    }
  }

  /**
   * Development logging with full details
   */
  private static devLog(error: unknown, context?: ErrorContext): void {
    const timestamp = new Date().toISOString();
    const prefix = context?.component ? `[${context.component}]` : "[Error]";

    console.group(`${prefix} ${timestamp}`);

    if (error instanceof Error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    } else {
      console.error("Error:", error);
    }

    if (context) {
      console.info("Context:", context);
    }

    console.groupEnd();
  }

  /**
   * Production logging - minimal and safe
   */
  private static prodLog(error: unknown, context?: ErrorContext): void {
    // In production, we might want to send errors to a service like Sentry
    // For now, we'll handle gracefully without console.error to avoid deployment warnings

    const errorInfo = {
      message: error instanceof Error ? error.message : String(error),
      component: context?.component || "unknown",
      action: context?.action || "unknown",
      timestamp: new Date().toISOString(),
    };

    // Could integrate with error reporting service here
    // Example: Sentry.captureException(error, { contexts: { errorInfo } });

    // For now, store in sessionStorage for debugging if needed
    try {
      const errors = JSON.parse(sessionStorage.getItem("app_errors") || "[]");
      errors.push(errorInfo);
      // Keep only last 10 errors to prevent storage bloat
      sessionStorage.setItem("app_errors", JSON.stringify(errors.slice(-10)));
    } catch {
      // Silent fail if sessionStorage is not available
    }
  }

  /**
   * Safe async error handler for promises
   */
  static async safeAsync<T>(
    promise: Promise<T>,
    context?: ErrorContext,
  ): Promise<T | null> {
    try {
      return await promise;
    } catch (error) {
      this.logError(error, context);
      return null;
    }
  }

  /**
   * Safe function wrapper
   */
  static safe<T extends (...args: unknown[]) => unknown>(
    fn: T,
    context?: ErrorContext,
  ): T {
    return ((...args: Parameters<T>) => {
      try {
        return fn(...args);
      } catch (error) {
        this.logError(error, context);
        return null;
      }
    }) as T;
  }

  /**
   * Network error handler
   */
  static handleNetworkError(error: unknown): {
    message: string;
    type: "network" | "timeout" | "server" | "unknown";
  } {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return {
        message:
          "Network connection error. Please check your internet connection.",
        type: "network",
      };
    }

    if (error instanceof Error && error.message.includes("timeout")) {
      return {
        message: "Request timed out. Please try again.",
        type: "timeout",
      };
    }

    if (error instanceof Error && error.message.includes("5")) {
      return {
        message: "Server error. Please try again later.",
        type: "server",
      };
    }

    return {
      message: "An unexpected error occurred. Please try again.",
      type: "unknown",
    };
  }

  /**
   * React error boundary helper
   */
  static handleReactError(
    error: Error,
    errorInfo: { componentStack: string },
  ): void {
    this.logError(error, {
      component: "ErrorBoundary",
      action: "render",
      metadata: { componentStack: errorInfo.componentStack },
    });
  }

  /**
   * Form validation error formatter
   */
  static formatValidationErrors(errors: Record<string, string[]>): string {
    return Object.entries(errors)
      .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
      .join("; ");
  }

  /**
   * API error formatter
   */
  static formatApiError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === "object" && error !== null) {
      const errorObj = error as Record<string, unknown>;
      if (errorObj.message) {
        return String(errorObj.message);
      }
      if (errorObj.error) {
        return String(errorObj.error);
      }
    }

    return "An unexpected error occurred";
  }
}

// Export convenience functions
export const logError = ProductionErrorHandler.logError.bind(
  ProductionErrorHandler,
);
export const safeAsync = ProductionErrorHandler.safeAsync.bind(
  ProductionErrorHandler,
);
export const safe = ProductionErrorHandler.safe.bind(ProductionErrorHandler);
export const handleNetworkError =
  ProductionErrorHandler.handleNetworkError.bind(ProductionErrorHandler);
export const formatApiError = ProductionErrorHandler.formatApiError.bind(
  ProductionErrorHandler,
);
