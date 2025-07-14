/**
 * Production console behavior simulator
 * Ensures development console matches production console behavior
 */

const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

// Store original console methods
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
  debug: console.debug,
};

/**
 * Enhanced console that simulates production behavior in development
 */
export const productionConsole = {
  log: (...args: any[]) => {
    // In production, console.log is often stripped out
    if (isDev) {
      originalConsole.log("[DEV-ONLY]", ...args);
    }
    // In production, this would be silent
  },

  warn: (...args: any[]) => {
    // Warnings should always show
    originalConsole.warn(...args);
  },

  error: (...args: any[]) => {
    // Errors should always show
    originalConsole.error(...args);

    // In production, log to error reporting service
    if (isProd) {
      // Send to error tracking service (Sentry, etc.)
      try {
        // Example: Sentry.captureException(new Error(args.join(' ')));
      } catch {
        // Fail silently if error service unavailable
      }
    }
  },

  info: (...args: any[]) => {
    // Info logs might be filtered in production
    if (isDev) {
      originalConsole.info("[INFO]", ...args);
    }
    // In production, this might go to analytics/monitoring
  },

  debug: (...args: any[]) => {
    // Debug logs are typically stripped in production
    if (isDev) {
      originalConsole.debug("[DEBUG]", ...args);
    }
    // In production, this would be silent
  },
};

/**
 * Replace global console with production-aware version
 */
export const enableProductionConsole = () => {
  if (isDev) {
    // In development, show warning about console usage
    originalConsole.warn(
      "🚨 Production Console Mode Enabled - console.log() calls will be silent in production!",
    );
  }

  // Override global console methods
  console.log = productionConsole.log;
  console.info = productionConsole.info;
  console.debug = productionConsole.debug;
  // Keep warn and error as-is since they should always work
};

/**
 * Restore original console behavior
 */
export const restoreOriginalConsole = () => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.info = originalConsole.info;
  console.debug = originalConsole.debug;
};

// Auto-enable production console behavior in development
if (isDev) {
  enableProductionConsole();
}
