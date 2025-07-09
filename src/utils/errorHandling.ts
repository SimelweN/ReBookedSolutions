import { toast } from "sonner";

// Comprehensive error handling utility to replace scattered error handling

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface HandledError {
  message: string;
  code?: string;
  severity: "low" | "medium" | "high" | "critical";
  shouldLog: boolean;
  shouldNotifyUser: boolean;
  userMessage?: string;
}

// Error classification
export const classifyError = (
  error: unknown,
  _context?: ErrorContext,
): HandledError => {
  // Handle different error types
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes("fetch") || error.message.includes("network")) {
      return {
        message: error.message,
        code: "NETWORK_ERROR",
        severity: "medium",
        shouldLog: true,
        shouldNotifyUser: true,
        userMessage:
          "Network connection issue. Please check your internet connection and try again.",
      };
    }

    // Authentication errors
    if (
      error.message.includes("auth") ||
      error.message.includes("unauthorized")
    ) {
      return {
        message: error.message,
        code: "AUTH_ERROR",
        severity: "high",
        shouldLog: true,
        shouldNotifyUser: true,
        userMessage: "Authentication failed. Please log in again.",
      };
    }

    // Database errors
    if (
      error.message.includes("database") ||
      error.message.includes("supabase")
    ) {
      return {
        message: error.message,
        code: "DATABASE_ERROR",
        severity: "high",
        shouldLog: true,
        shouldNotifyUser: true,
        userMessage: "Database connection issue. Please try again in a moment.",
      };
    }

    // Validation errors
    if (
      error.message.includes("validation") ||
      error.message.includes("required")
    ) {
      return {
        message: error.message,
        code: "VALIDATION_ERROR",
        severity: "low",
        shouldLog: false,
        shouldNotifyUser: true,
        userMessage: error.message,
      };
    }

    // Payment errors
    if (
      error.message.includes("payment") ||
      error.message.includes("paystack")
    ) {
      return {
        message: error.message,
        code: "PAYMENT_ERROR",
        severity: "high",
        shouldLog: true,
        shouldNotifyUser: true,
        userMessage:
          "Payment processing error. Please try again or contact support.",
      };
    }

    // Timeout errors
    if (
      error.message.includes("timeout") ||
      error.message.includes("timed out")
    ) {
      return {
        message: error.message,
        code: "TIMEOUT_ERROR",
        severity: "medium",
        shouldLog: true,
        shouldNotifyUser: true,
        userMessage: "Request timed out. Please try again.",
      };
    }

    // Generic error
    return {
      message: error.message,
      code: "GENERIC_ERROR",
      severity: "medium",
      shouldLog: true,
      shouldNotifyUser: true,
      userMessage: "An unexpected error occurred. Please try again.",
    };
  }

  // String errors
  if (typeof error === "string") {
    return {
      message: error,
      code: "STRING_ERROR",
      severity: "medium",
      shouldLog: true,
      shouldNotifyUser: true,
      userMessage: error,
    };
  }

  // Unknown error type
  return {
    message: "Unknown error occurred",
    code: "UNKNOWN_ERROR",
    severity: "medium",
    shouldLog: true,
    shouldNotifyUser: true,
    userMessage: "An unexpected error occurred. Please try again.",
  };
};

// Safe error logging that won't fail
export const logError = (error: HandledError, context?: ErrorContext): void => {
  if (!error.shouldLog) return;

  const logData = {
    message: error.message,
    code: error.code,
    severity: error.severity,
    timestamp: new Date().toISOString(),
    context: context || {},
  };

  // Only log to console in development
  if (import.meta.env.DEV) {
    console.error("[Error Handler]", logData);
  }

  // In production, you might want to send to a logging service
  // Example: sendToLoggingService(logData);
};

// Safe log error utility that handles any error type
export const safeLogError = (
  message: string,
  error: unknown,
  context?: ErrorContext,
): void => {
  const handledError = classifyError(error, context);

  // Only log to console in development
  if (import.meta.env.DEV) {
    console.error(`[${message}]`, {
      error: handledError.message,
      code: handledError.code,
      severity: handledError.severity,
      context: context || {},
      originalError: error,
    });
  }
};

// Show user-friendly error messages
export const notifyUser = (error: HandledError): void => {
  if (!error.shouldNotifyUser) return;

  const message = error.userMessage || error.message;

  switch (error.severity) {
    case "critical":
      toast.error(message, {
        duration: 10000, // Show for 10 seconds
        action: {
          label: "Reload",
          onClick: () => window.location.reload(),
        },
      });
      break;
    case "high":
      toast.error(message, { duration: 6000 });
      break;
    case "medium":
      toast.error(message, { duration: 4000 });
      break;
    case "low":
      toast.warning(message, { duration: 3000 });
      break;
  }
};

// Main error handler
export const handleError = (error: unknown, context?: ErrorContext): void => {
  const handledError = classifyError(error, context);

  logError(handledError, context);
  notifyUser(handledError);
};

// Async error handler with automatic retry logic
export const handleAsyncError = async (
  error: unknown,
  context?: ErrorContext,
  retryFn?: () => Promise<void>,
  maxRetries: number = 0,
): Promise<void> => {
  const handledError = classifyError(error, context);

  logError(handledError, context);

  // For network errors, offer retry
  if (handledError.code === "NETWORK_ERROR" && retryFn && maxRetries > 0) {
    toast.error(handledError.userMessage || handledError.message, {
      duration: 6000,
      action: {
        label: "Retry",
        onClick: async () => {
          try {
            await retryFn();
          } catch (retryError) {
            await handleAsyncError(
              retryError,
              context,
              retryFn,
              maxRetries - 1,
            );
          }
        },
      },
    });
  } else {
    notifyUser(handledError);
  }
};

// Helper for handling form errors
export const handleFormError = (
  error: unknown,
  fieldName?: string,
): Record<string, string> => {
  const handledError = classifyError(error);

  if (handledError.code === "VALIDATION_ERROR" && fieldName) {
    return { [fieldName]: handledError.message };
  }

  // For non-validation errors, show toast and return empty errors
  notifyUser(handledError);
  return {};
};

// Helper for handling API responses
export const handleApiResponse = <T>(
  response: { data?: T; error?: unknown },
  context?: ErrorContext,
): T | null => {
  if (response.error) {
    handleError(response.error, context);
    return null;
  }

  return response.data || null;
};

// Error boundary error handler
export const handleBoundaryError = (
  error: Error,
  errorInfo: Record<string, unknown>,
): void => {
  const handledError: HandledError = {
    message: `React Error Boundary: ${error.message}`,
    code: "BOUNDARY_ERROR",
    severity: "critical",
    shouldLog: true,
    shouldNotifyUser: true,
    userMessage:
      "The application encountered an error. The page will reload automatically.",
  };

  logError(handledError, {
    component: "ErrorBoundary",
    metadata: {
      stack: error.stack,
      errorInfo: errorInfo,
    },
  });

  // For critical errors, automatically reload after showing message
  toast.error(handledError.userMessage!, {
    duration: 5000,
    action: {
      label: "Reload Now",
      onClick: () => window.location.reload(),
    },
  });

  // Auto-reload after 5 seconds
  setTimeout(() => {
    window.location.reload();
  }, 5000);
};

// Safe fetch wrapper with automatic error handling
export const safeFetch = async <T>(
  url: string,
  options?: RequestInit,
  context?: ErrorContext,
): Promise<T | null> => {
  try {
    const response = await fetch(url, {
      ...options,
      // Add default timeout
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    handleError(error, { ...context, action: "fetch" });
    return null;
  }
};

// Debounced error handler to prevent spam
const errorCounts = new Map<string, number>();
const ERROR_LIMIT = 5;
const ERROR_WINDOW = 60000; // 1 minute

export const handleErrorDebounced = (
  error: unknown,
  context?: ErrorContext,
): void => {
  const handledError = classifyError(error, context);
  const errorKey = `${handledError.code}-${handledError.message}`;

  const count = errorCounts.get(errorKey) || 0;
  if (count >= ERROR_LIMIT) {
    // Too many of the same error, skip
    return;
  }

  errorCounts.set(errorKey, count + 1);

  // Clear count after window
  setTimeout(() => {
    errorCounts.delete(errorKey);
  }, ERROR_WINDOW);

  handleError(error, context);
};
