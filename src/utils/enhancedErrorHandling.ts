import { toast } from "sonner";

export interface ErrorInfo {
  type:
    | "network"
    | "authentication"
    | "permission"
    | "database"
    | "validation"
    | "unknown";
  message: string;
  userMessage: string;
  shouldRetry: boolean;
  critical: boolean;
}

/**
 * Enhanced error analysis that distinguishes between different error types
 * to provide better user experience and avoid misleading "connection" messages
 */
export const analyzeError = (error: any, context?: string): ErrorInfo => {
  const errorMessage = error?.message || String(error);
  const errorCode = error?.code || error?.status;

  // Network/Connection Errors (real connectivity issues)
  if (
    errorMessage.includes("Failed to fetch") ||
    errorMessage.includes("NetworkError") ||
    errorMessage.includes("ERR_NETWORK") ||
    errorMessage.includes("ERR_INTERNET_DISCONNECTED") ||
    !navigator.onLine
  ) {
    return {
      type: "network",
      message: errorMessage,
      userMessage:
        "Connection failed. Please check your internet and try again.",
      shouldRetry: true,
      critical: false,
    };
  }

  // Authentication Errors (not connection issues)
  if (
    errorMessage.includes("JWT") ||
    errorMessage.includes("Invalid login") ||
    errorMessage.includes("Unauthorized") ||
    errorMessage.includes("auth") ||
    errorCode === 401
  ) {
    return {
      type: "authentication",
      message: errorMessage,
      userMessage: "Please log in again to continue.",
      shouldRetry: false,
      critical: false,
    };
  }

  // Permission/Access Errors (not connection issues)
  if (
    errorMessage.includes("permission") ||
    errorMessage.includes("RLS") ||
    errorMessage.includes("access denied") ||
    errorCode === 403 ||
    errorCode === "PGRST301"
  ) {
    return {
      type: "permission",
      message: errorMessage,
      userMessage: "You don't have permission to access this feature.",
      shouldRetry: false,
      critical: false,
    };
  }

  // Database/API Errors (server-side issues, not connection)
  if (
    errorCode === "PGRST116" || // Not found
    errorCode === "42P01" || // Table doesn't exist
    errorMessage.includes("relation") ||
    errorMessage.includes("table") ||
    errorCode >= 500
  ) {
    return {
      type: "database",
      message: errorMessage,
      userMessage:
        "Service temporarily unavailable. Our team has been notified.",
      shouldRetry: true,
      critical: true,
    };
  }

  // Validation Errors (user input issues)
  if (
    (errorCode >= 400 && errorCode < 500) ||
    errorMessage.includes("validation") ||
    errorMessage.includes("invalid")
  ) {
    return {
      type: "validation",
      message: errorMessage,
      userMessage: errorMessage, // Use the original message for validation errors
      shouldRetry: false,
      critical: false,
    };
  }

  // Timeout errors (could be network or server)
  if (errorMessage.includes("timeout") || errorMessage.includes("Timeout")) {
    return {
      type: "network",
      message: errorMessage,
      userMessage: "Request timed out. Please try again.",
      shouldRetry: true,
      critical: false,
    };
  }

  // Unknown errors
  return {
    type: "unknown",
    message: errorMessage,
    userMessage: "Something went wrong. Please try again.",
    shouldRetry: true,
    critical: false,
  };
};

/**
 * Smart error handler that shows appropriate messages and actions
 */
export const handleErrorSmart = (
  error: any,
  context?: string,
  options?: {
    showToast?: boolean;
    onRetry?: () => void;
    silent?: boolean;
  },
): ErrorInfo => {
  const errorInfo = analyzeError(error, context);

  if (!options?.silent) {
    console.error(
      `[${context || "Unknown"}] ${errorInfo.type} error:`,
      errorInfo.message,
    );
  }

  if (options?.showToast !== false) {
    if (errorInfo.critical) {
      toast.error(errorInfo.userMessage, {
        description: context ? `Failed in: ${context}` : undefined,
        action:
          errorInfo.shouldRetry && options?.onRetry
            ? {
                label: "Retry",
                onClick: options.onRetry,
              }
            : undefined,
      });
    } else if (errorInfo.type === "network") {
      toast.warning(errorInfo.userMessage, {
        description: "Check your internet connection",
        action:
          errorInfo.shouldRetry && options?.onRetry
            ? {
                label: "Retry",
                onClick: options.onRetry,
              }
            : undefined,
      });
    } else {
      toast.error(errorInfo.userMessage);
    }
  }

  return errorInfo;
};

/**
 * Wrapper for async operations with smart error handling
 */
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context: string,
  options?: {
    retries?: number;
    onError?: (error: ErrorInfo) => void;
    fallback?: T;
  },
): Promise<T | undefined> => {
  const maxRetries = options?.retries || 0;
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      const errorInfo = analyzeError(error, context);

      // Don't retry for certain error types
      if (!errorInfo.shouldRetry || attempt === maxRetries) {
        handleErrorSmart(error, context, {
          showToast: true,
          onRetry: attempt < maxRetries ? () => operation() : undefined,
        });

        if (options?.onError) {
          options.onError(errorInfo);
        }

        return options?.fallback;
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000),
        );
      }
    }
  }

  return options?.fallback;
};

/**
 * Check if an error is a real connection issue (not auth/permission)
 */
export const isRealConnectionError = (error: any): boolean => {
  const errorInfo = analyzeError(error);
  return errorInfo.type === "network";
};

/**
 * Get user-friendly error message without technical details
 */
export const getUserFriendlyError = (error: any, context?: string): string => {
  const errorInfo = analyzeError(error, context);
  return errorInfo.userMessage;
};
