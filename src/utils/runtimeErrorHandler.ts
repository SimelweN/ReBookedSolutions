/**
 * Comprehensive runtime error handler
 * Catches and handles all runtime errors gracefully
 */

const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

// Store original error handlers
const originalOnError = window.onerror;
const originalOnUnhandledRejection = window.onunhandledrejection;

/**
 * Database-related error patterns
 */
const DATABASE_ERROR_PATTERNS = [
  'relation "graphql_public.',
  'table "public.',
  "does not exist",
  "TABLE_NOT_FOUND",
  "HTTP 404",
  "No connection available",
  "Failed to fetch",
  "NetworkError",
];

/**
 * Third-party error patterns that should be suppressed
 */
const THIRD_PARTY_ERROR_PATTERNS = [
  "Script error",
  "Non-Error promise rejection captured",
  "ResizeObserver loop limit exceeded",
  "Uncaught TypeError: Cannot read properties of null",
  "chrome-extension://",
  "moz-extension://",
  "safari-extension://",
  "datadog",
  "gtm",
  "google",
];

/**
 * Check if error is database-related
 */
const isDatabaseError = (message: string): boolean => {
  return DATABASE_ERROR_PATTERNS.some((pattern) =>
    message.toLowerCase().includes(pattern.toLowerCase()),
  );
};

/**
 * Check if error is from third-party scripts
 */
const isThirdPartyError = (message: string, filename?: string): boolean => {
  return THIRD_PARTY_ERROR_PATTERNS.some(
    (pattern) =>
      message.toLowerCase().includes(pattern.toLowerCase()) ||
      (filename && filename.toLowerCase().includes(pattern.toLowerCase())),
  );
};

/**
 * Handle database errors gracefully
 */
const handleDatabaseError = (error: any) => {
  if (isDev) {
    console.warn(
      "🗃️ Database error detected - this is expected if database setup is incomplete",
      { error: error.message || error },
    );
  }

  // Don't crash the app - return a safe fallback
  return true; // Prevent default error handling
};

/**
 * Handle third-party errors gracefully
 */
const handleThirdPartyError = (error: any) => {
  if (isDev) {
    console.debug("��� Third-party error suppressed:", error.message || error);
  }

  // Suppress third-party errors
  return true; // Prevent default error handling
};

/**
 * Enhanced error handler for global errors
 */
const enhancedErrorHandler = (
  message: string | Event,
  filename?: string,
  lineno?: number,
  colno?: number,
  error?: Error,
): boolean => {
  const errorMessage = message.toString();

  // Handle database errors
  if (isDatabaseError(errorMessage)) {
    return handleDatabaseError({
      message: errorMessage,
      filename,
      lineno,
      colno,
      error,
    });
  }

  // Handle third-party errors
  if (isThirdPartyError(errorMessage, filename)) {
    return handleThirdPartyError({
      message: errorMessage,
      filename,
      lineno,
      colno,
      error,
    });
  }

  // For production, log to error service
  if (isProd) {
    try {
      // Example: Send to error tracking service
      // Sentry.captureException(error || new Error(errorMessage));
    } catch {
      // Fail silently if error service unavailable
    }
  }

  // For development, show detailed error
  if (isDev) {
    console.error("Runtime Error:", {
      message: errorMessage,
      filename,
      lineno,
      colno,
      error,
    });
  }

  // Let original handler process non-suppressed errors
  if (originalOnError) {
    return originalOnError(message, filename, lineno, colno, error);
  }

  return false; // Allow default error handling
};

/**
 * Enhanced unhandled promise rejection handler
 */
const enhancedRejectionHandler = (event: PromiseRejectionEvent): boolean => {
  const reason = event.reason;
  const reasonMessage =
    reason?.message || reason?.toString() || "Unknown promise rejection";

  // Handle database errors
  if (isDatabaseError(reasonMessage)) {
    event.preventDefault(); // Prevent unhandled rejection warning
    return handleDatabaseError(reason);
  }

  // Handle third-party errors
  if (isThirdPartyError(reasonMessage)) {
    event.preventDefault(); // Prevent unhandled rejection warning
    return handleThirdPartyError(reason);
  }

  // For production, log to error service
  if (isProd) {
    try {
      // Example: Send to error tracking service
      // Sentry.captureException(reason instanceof Error ? reason : new Error(reasonMessage));
    } catch {
      // Fail silently if error service unavailable
    }
  }

  // For development, show detailed error
  if (isDev) {
    console.error("Unhandled Promise Rejection:", reason);
  }

  // Let original handler process non-suppressed errors
  if (originalOnUnhandledRejection) {
    return originalOnUnhandledRejection(event);
  }

  return false; // Allow default handling
};

/**
 * Install enhanced error handlers
 */
export const installRuntimeErrorHandlers = () => {
  // Install global error handler
  window.onerror = enhancedErrorHandler;

  // Install unhandled promise rejection handler
  window.onunhandledrejection = enhancedRejectionHandler;

  if (isDev) {
    console.log("🛡️ Enhanced runtime error handlers installed");
  }
};

/**
 * Restore original error handlers
 */
export const restoreOriginalErrorHandlers = () => {
  window.onerror = originalOnError;
  window.onunhandledrejection = originalOnUnhandledRejection;

  if (isDev) {
    console.log("🔄 Original error handlers restored");
  }
};

/**
 * Manual error reporting function
 */
export const reportError = (error: Error | string, context?: any) => {
  const errorMessage = error instanceof Error ? error.message : error;

  // Don't report database or third-party errors
  if (isDatabaseError(errorMessage) || isThirdPartyError(errorMessage)) {
    return;
  }

  if (isProd) {
    try {
      // Send to error tracking service
      // Sentry.captureException(error instanceof Error ? error : new Error(errorMessage), { extra: context });
    } catch {
      // Fail silently
    }
  } else {
    console.error("Manual Error Report:", { error, context });
  }
};

// Auto-install error handlers
installRuntimeErrorHandlers();
