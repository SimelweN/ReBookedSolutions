/**
 * Enhanced error handling utilities to prevent [object Object] logging issues
 */

/**
 * Formats an error for logging to prevent [object Object] issues
 */
export const formatErrorForLogging = (error: unknown): any => {
  if (error === null || error === undefined) {
    return { value: error, type: typeof error };
  }

  if (error instanceof Error) {
    return {
      type: "Error",
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  if (
    typeof error === "string" ||
    typeof error === "number" ||
    typeof error === "boolean"
  ) {
    return { value: error, type: typeof error };
  }

  if (typeof error === "object") {
    try {
      const errorObj = error as any;

      // Create a safe, flat representation
      const safeObj: any = {
        type: "object",
        constructor: errorObj.constructor?.name || "Unknown",
      };

      // Extract common error properties safely
      if (errorObj.message !== undefined) {
        safeObj.message = String(errorObj.message);
      }
      if (errorObj.code !== undefined) {
        safeObj.code = String(errorObj.code);
      }
      if (errorObj.details !== undefined) {
        safeObj.details = String(errorObj.details);
      }
      if (errorObj.hint !== undefined) {
        safeObj.hint = String(errorObj.hint);
      }
      if (errorObj.name !== undefined) {
        safeObj.name = String(errorObj.name);
      }
      if (errorObj.status !== undefined) {
        safeObj.status = String(errorObj.status);
      }
      if (errorObj.statusText !== undefined) {
        safeObj.statusText = String(errorObj.statusText);
      }

      // Try to get enumerable properties safely
      try {
        const keys = Object.keys(errorObj).slice(0, 10); // Limit to first 10 keys
        safeObj.availableKeys = keys;

        // Add a few more common properties if they exist
        keys.forEach((key) => {
          if (!safeObj[key] && key !== "originalError") {
            try {
              const value = errorObj[key];
              if (
                typeof value === "string" ||
                typeof value === "number" ||
                typeof value === "boolean"
              ) {
                safeObj[key] = value;
              } else if (value !== null && value !== undefined) {
                safeObj[key] = `[${typeof value}]`;
              }
            } catch {
              // Skip problematic properties
            }
          }
        });
      } catch {
        // Skip if can't enumerate properties
      }

      return safeObj;
    } catch (e) {
      // Ultimate fallback
      return {
        type: "object",
        error: "Could not serialize error object",
        fallback: String(error),
      };
    }
  }

  return { value: String(error), type: typeof error };
};

/**
 * Safely logs an error with proper formatting
 */
export const safeLogError = (
  context: string,
  error: unknown,
  additionalData?: any,
) => {
  const errorMessage = getReadableErrorMessage(error);
  const errorCode =
    (error as any)?.code || (error as any)?.error_code || "NO_CODE";

  // Log a simple, readable message only
  const simpleMessage = `${context}: ${errorMessage}${errorCode !== "NO_CODE" ? ` (${errorCode})` : ""}`;
  console.error(simpleMessage);

  // Only log detailed info in development mode and only as strings
  if (import.meta.env.DEV) {
    const formattedError = formatErrorForLogging(error);
    console.error(
      `[${context}] Error details: ${JSON.stringify(formattedError, null, 2)}`,
    );
  }

  return errorMessage;
};

/**
 * Enhanced console.error wrapper that prevents [object Object] logging
 */
export const logErrorSafely = (message: string, error: unknown) => {
  const errorInfo = formatErrorForLogging(error);
  console.error(message, errorInfo);
  return errorInfo;
};

/**
 * Get a readable error message from any error type
 */
export const getReadableErrorMessage = (error: unknown): string => {
  if (error === null || error === undefined) {
    return "Unknown error occurred";
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error === "object") {
    const errorObj = error as any;

    // Check for common error message properties
    if (errorObj.message) {
      return String(errorObj.message);
    }

    if (errorObj.error) {
      return String(errorObj.error);
    }

    if (errorObj.details) {
      return String(errorObj.details);
    }

    // Fallback to stringification
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }

  return String(error);
};

/**
 * Creates a standardized error handler for async operations
 */
export const createErrorHandler = (context: string) => {
  return (error: unknown) => {
    const formattedError = safeLogError(context, error);
    const readableMessage = getReadableErrorMessage(error);

    return {
      formattedError,
      readableMessage,
      originalError: error,
    };
  };
};

export default {
  formatErrorForLogging,
  safeLogError,
  logErrorSafely,
  getReadableErrorMessage,
  createErrorHandler,
};
