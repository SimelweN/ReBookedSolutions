import { startTransition } from "react";

/**
 * Wrapper utility to handle async operations safely in React 18
 * Prevents "A component suspended while responding to synchronous input" errors
 */

export type AsyncOperation<T = any> = () => Promise<T>;
export type ErrorHandler = (error: any) => void;

interface AsyncWrapperOptions {
  onError?: ErrorHandler;
  onSuccess?: (result: any) => void;
  onFinally?: () => void;
}

/**
 * Safely execute async operations with startTransition to prevent Suspense issues
 */
export function safeAsync<T>(
  operation: AsyncOperation<T>,
  options: AsyncWrapperOptions = {},
): void {
  const { onError, onSuccess, onFinally } = options;

  startTransition(() => {
    (async () => {
      try {
        const result = await operation();
        if (onSuccess) {
          onSuccess(result);
        }
      } catch (error) {
        console.error("Async operation failed:", error);
        if (onError) {
          onError(error);
        } else {
          // Default error handling
          console.error("Unhandled async error:", error);
        }
      } finally {
        if (onFinally) {
          onFinally();
        }
      }
    })();
  });
}

/**
 * Safe wrapper for notification requests specifically
 */
export function safeNotificationRequest(
  operation: AsyncOperation,
  options: {
    onSuccess?: (result: any) => void;
    onError?: ErrorHandler;
    setLoading?: (loading: boolean) => void;
  } = {},
): void {
  const { onSuccess, onError, setLoading } = options;

  if (setLoading) setLoading(true);

  safeAsync(operation, {
    onSuccess,
    onError: (error) => {
      // Enhanced error handling for notification requests
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (errorMessage.includes("does not exist")) {
        console.log("Notification system not available:", errorMessage);
        // Let the calling component handle this gracefully
      } else {
        console.error("Notification request error:", errorMessage);
      }

      if (onError) {
        onError(error);
      }
    },
    onFinally: () => {
      if (setLoading) setLoading(false);
    },
  });
}

/**
 * Safe wrapper for APS-related async operations
 */
export function safeAPSOperation<T>(
  operation: AsyncOperation<T>,
  options: {
    onSuccess?: (result: T) => void;
    onError?: ErrorHandler;
    fallbackValue?: T;
  } = {},
): void {
  const { onSuccess, onError, fallbackValue } = options;

  safeAsync(operation, {
    onSuccess,
    onError: (error) => {
      console.error("APS operation error:", error);

      // Provide fallback value if available
      if (fallbackValue !== undefined && onSuccess) {
        onSuccess(fallbackValue);
      }

      if (onError) {
        onError(error);
      }
    },
  });
}

/**
 * Safe wrapper for database operations
 */
export function safeDatabaseOperation<T>(
  operation: AsyncOperation<T>,
  options: {
    onSuccess?: (result: T) => void;
    onError?: ErrorHandler;
    retryCount?: number;
  } = {},
): void {
  const { onSuccess, onError, retryCount = 0 } = options;

  safeAsync(operation, {
    onSuccess,
    onError: (error) => {
      console.error("Database operation error:", error);

      // Retry logic for transient database errors
      if (retryCount > 0 && error.message?.includes("network")) {
        console.log(
          `Retrying database operation... (${retryCount} attempts left)`,
        );
        setTimeout(() => {
          safeDatabaseOperation(operation, {
            ...options,
            retryCount: retryCount - 1,
          });
        }, 1000);
        return;
      }

      if (onError) {
        onError(error);
      }
    },
  });
}

/**
 * Error serialization utility to prevent [object Object] in logs
 */
export function serializeError(error: any): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    return JSON.stringify(error, Object.getOwnPropertyNames(error));
  }

  return String(error);
}

/**
 * Enhanced console.error that properly serializes errors
 */
export function logError(message: string, error: any): void {
  console.error(message, serializeError(error));
}
