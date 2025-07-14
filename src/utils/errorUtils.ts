import { PostgrestError } from "@supabase/supabase-js";

/**
 * Enhanced error logging with proper serialization
 */
export const logError = (context: string, error: unknown) => {
  const timestamp = new Date().toISOString();

  console.group(`🚨 [${context}] ${timestamp}`);

  if (error instanceof Error) {
    console.error("Error Message:", error.message);
    console.error("Error Name:", error.name);
    if (error.stack) console.error("Stack Trace:", error.stack);
  } else if (error && typeof error === "object") {
    console.error("Error Type: Object");

    // Safely extract common properties
    const errorObj = error as any;
    if (errorObj.message) console.error("Message:", errorObj.message);
    if (errorObj.code) console.error("Code:", errorObj.code);
    if (errorObj.error_code) console.error("Error Code:", errorObj.error_code);
    if (errorObj.details) console.error("Details:", errorObj.details);
    if (errorObj.hint) console.error("Hint:", errorObj.hint);

    // Try to serialize the full object
    try {
      const serialized = JSON.stringify(error, null, 2);
      console.error("Full Object:", serialized);
    } catch (jsonError) {
      console.error("Object (non-serializable):", String(error));
      try {
        console.error("Object Keys:", Object.keys(error));
      } catch (keysError) {
        console.error("Cannot extract object keys");
      }
    }
  } else {
    console.error("Error (primitive):", error);
    console.error("Error Type:", typeof error);
  }

  // Classification
  const errorClassification = {
    isNetworkError: isNetworkError(error),
    isAuthError: isAuthError(error),
    isDatabaseError: isDatabaseError(error),
  };

  console.error("Error Classification:", errorClassification);

  console.groupEnd();

  return errorClassification;
};

/**
 * Get a user-friendly error message
 */
export const getErrorMessage = (
  error: unknown,
  fallback: string = "An error occurred",
): string => {
  if (!error) return fallback;

  // Handle Supabase/Postgres errors
  if (isDatabaseError(error)) {
    const pgError = error as PostgrestError;

    // Common database error codes
    switch (pgError.code) {
      case "23505":
        return "This record already exists";
      case "23503":
        return "Referenced record not found";
      case "42P01":
        return "Database table not found";
      case "PGRST116":
        return "Record not found";
      case "PGRST301":
        return "Unauthorized access";
      default:
        return pgError.message || pgError.hint || fallback;
    }
  }

  // Handle network errors
  if (isNetworkError(error)) {
    if (error instanceof Error) {
      if (error.message.includes("Failed to fetch")) {
        return "Network connection failed. Please check your internet connection and try again.";
      }
      if (error.message.includes("timeout")) {
        return "Request timed out. Please try again.";
      }
      if (error.message.includes("CORS")) {
        return "Network access blocked. Please refresh the page and try again.";
      }
    }
    return "Network error. Please check your connection and try again.";
  }

  // Handle auth errors
  if (isAuthError(error)) {
    const authError = error as any;
    switch (authError.message || authError.error_description) {
      case "Invalid login credentials":
        return "Invalid email or password";
      case "Email not confirmed":
        return "Please verify your email address";
      case "Too many requests":
        return "Too many attempts. Please wait a moment and try again";
      default:
        return (
          authError.message ||
          authError.error_description ||
          "Authentication error"
        );
    }
  }

  // Handle generic errors
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  // Handle objects that might have error properties
  if (error && typeof error === "object") {
    const errorObj = error as any;

    // Try various common error properties
    const possibleMessage =
      errorObj.message ||
      errorObj.error ||
      errorObj.error_description ||
      errorObj.details ||
      errorObj.hint ||
      errorObj.statusText ||
      errorObj.description;

    if (possibleMessage && typeof possibleMessage === "string") {
      return possibleMessage;
    }

    // Try to get meaningful error info from nested properties
    if (errorObj.error && typeof errorObj.error === "object") {
      const nestedMessage =
        errorObj.error.message || errorObj.error.description;
      if (nestedMessage && typeof nestedMessage === "string") {
        return nestedMessage;
      }
    }

    // If object has meaningful properties, try to serialize them
    try {
      const serialized = JSON.stringify(error, null, 2);
      if (serialized && serialized !== "{}" && serialized !== "null") {
        // Make sure the serialized object is readable
        if (serialized.length > 200) {
          // If too long, try to extract key info
          const keyInfo = {
            message: errorObj.message,
            code: errorObj.code,
            error: errorObj.error,
            status: errorObj.status,
          };
          return `Error: ${JSON.stringify(keyInfo)}`;
        }
        return `Error details: ${serialized}`;
      }
    } catch (jsonError) {
      // JSON.stringify failed, try alternative
      try {
        const keys = Object.keys(error);
        if (keys.length > 0) {
          const keyValues = keys
            .slice(0, 3)
            .map((key) => `${key}: ${errorObj[key]}`)
            .join(", ");
          return `Error: ${keyValues}`;
        }
      } catch {
        // Continue to fallback
      }
    }
  }

  // Last resort - avoid [object Object]
  const stringified = String(error);
  if (stringified && stringified !== "[object Object]") {
    return stringified;
  }

  return fallback;
};

/**
 * Check if error is a network-related error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (!error) return false;

  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  return (
    message.includes("failed to fetch") ||
    message.includes("network error") ||
    message.includes("timeout") ||
    message.includes("cors") ||
    message.includes("connection") ||
    message.includes("unreachable") ||
    (error as any)?.code === "NETWORK_ERROR" ||
    (error as any)?.name === "NetworkError"
  );
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error: unknown): boolean => {
  if (!error) return false;

  const errorObj = error as any;
  return (
    errorObj?.name === "AuthError" ||
    errorObj?.error === "invalid_grant" ||
    errorObj?.error === "unauthorized" ||
    (typeof errorObj?.message === "string" &&
      (errorObj.message.includes("Invalid login credentials") ||
        errorObj.message.includes("Email not confirmed") ||
        errorObj.message.includes("JWT") ||
        errorObj.message.includes("token")))
  );
};

/**
 * Check if error is a database error
 */
export const isDatabaseError = (error: unknown): boolean => {
  if (!error) return false;

  const errorObj = error as any;
  return (
    errorObj?.code || // Postgres error codes
    errorObj?.error_code || // Alternative error code field
    (typeof errorObj?.message === "string" &&
      errorObj.message.includes("PGRST")) ||
    errorObj?.details !== undefined ||
    errorObj?.hint !== undefined
  );
};

/**
 * Retry operation with exponential backoff for network errors
 */
export const retryWithExponentialBackoff = async <T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    retryCondition?: (error: unknown) => boolean;
  } = {},
): Promise<T> => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    retryCondition = isNetworkError,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry if this isn't a retryable error
      if (!retryCondition(error)) {
        throw error;
      }

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);

      console.warn(
        `Attempt ${attempt + 1}/${maxRetries + 1} failed, retrying in ${delay}ms`,
        {
          error: getErrorMessage(error),
          attempt: attempt + 1,
          delay,
        },
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Create a timeout promise that rejects after specified duration
 */
export const createTimeoutPromise = (
  timeoutMs: number,
  errorMessage?: string,
) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      const error = new Error(
        errorMessage || `Operation timed out after ${timeoutMs}ms`,
      );
      (error as any).isTimeout = true;
      reject(error);
    }, timeoutMs);
  });
};

/**
 * Race a promise against a timeout
 */
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage?: string,
): Promise<T> => {
  return Promise.race([promise, createTimeoutPromise(timeoutMs, errorMessage)]);
};

/**
 * Legacy function aliases for backward compatibility
 */
export const logDatabaseError = logError;
export const getUserErrorMessage = getErrorMessage;
export const logQueryDebug = (context: string, query: any, result?: any) => {
  if (import.meta.env.DEV) {
    console.log(`[Query Debug] ${context}:`, { query, result });
  }
};
