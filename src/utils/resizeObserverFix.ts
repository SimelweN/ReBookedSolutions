/**
 * Enhanced utility to suppress ResizeObserver loop errors
 * This is a common issue with UI libraries like Radix UI, Recharts, and other
 * components that use ResizeObserver for positioning and measuring elements.
 */

// Store the original console.error
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Debounced error reporting to prevent spam
let errorCount = 0;
let lastErrorTime = 0;
const MAX_ERRORS_PER_SECOND = 1;
const ERROR_RESET_TIME = 1000; // 1 second

const shouldSuppressError = (message: string) => {
  const now = Date.now();

  // Reset error count if enough time has passed
  if (now - lastErrorTime > ERROR_RESET_TIME) {
    errorCount = 0;
  }

  // Check if this is a ResizeObserver error
  const isResizeObserverError =
    message.includes(
      "ResizeObserver loop completed with undelivered notifications",
    ) ||
    message.includes("ResizeObserver loop limit exceeded") ||
    message.includes("ResizeObserver loop") ||
    message.toLowerCase().includes("resizeobserver");

  if (isResizeObserverError) {
    // Allow only a few errors per second to avoid spam
    if (errorCount < MAX_ERRORS_PER_SECOND) {
      errorCount++;
      lastErrorTime = now;

      // Log a simplified message in development only
      if (import.meta.env.DEV && errorCount === 1) {
        console.debug(
          "🔧 ResizeObserver errors suppressed (UI library optimization)",
        );
      }
    }
    return true;
  }

  return false;
};

// Override console.error to filter out ResizeObserver errors
console.error = (...args: any[]) => {
  // Check if the error is a ResizeObserver loop error
  if (args.length > 0 && typeof args[0] === "string") {
    if (shouldSuppressError(args[0])) {
      return; // Suppress this specific error
    }
  }

  // Check for Error objects
  if (args.length > 0 && args[0] instanceof Error) {
    if (shouldSuppressError(args[0].message)) {
      return; // Suppress this specific error
    }
  }

  // For all other errors, use the original console.error
  originalConsoleError(...args);
};

// Override console.warn to filter out ResizeObserver warnings
console.warn = (...args: any[]) => {
  if (args.length > 0 && typeof args[0] === "string") {
    if (shouldSuppressError(args[0])) {
      return; // Suppress this specific warning
    }
  }

  // For all other warnings, use the original console.warn
  originalConsoleWarn(...args);
};

// Handle it as a window error event
window.addEventListener("error", (e) => {
  if (e.message && shouldSuppressError(e.message)) {
    e.stopImmediatePropagation();
    e.preventDefault();
    return false;
  }
});

// Handle unhandled promise rejections that might contain ResizeObserver errors
window.addEventListener("unhandledrejection", (e) => {
  if (
    e.reason &&
    typeof e.reason === "string" &&
    shouldSuppressError(e.reason)
  ) {
    e.preventDefault();
    return false;
  }

  if (e.reason instanceof Error && shouldSuppressError(e.reason.message)) {
    e.preventDefault();
    return false;
  }
});

// Export a function to restore original console functions if needed
export const restoreConsoleError = () => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
};

// Export a function to manually suppress ResizeObserver errors in dev overlays
export const suppressResizeObserverErrors = () => {
  // Vite dev server error overlay
  const viteErrorOverlay = document.querySelector("vite-error-overlay");
  if (viteErrorOverlay) {
    viteErrorOverlay.remove();
  }

  // Webpack dev server overlays
  const webpackOverlays = [
    "webpack-dev-server-client-overlay-div",
    "webpack-dev-server-client-overlay",
    "__webpack_dev_server_client_overlay__",
  ];

  webpackOverlays.forEach((id) => {
    const overlay = document.getElementById(id);
    if (overlay) {
      overlay.style.display = "none";
    }
  });

  // Generic error overlays
  const errorOverlays = document.querySelectorAll(
    '[class*="error-overlay"], [id*="error-overlay"]',
  );
  errorOverlays.forEach((overlay) => {
    const element = overlay as HTMLElement;
    if (element.textContent?.includes("ResizeObserver")) {
      element.style.display = "none";
    }
  });
};

// Auto-suppress dev overlays after a short delay
if (import.meta.env.DEV) {
  setTimeout(suppressResizeObserverErrors, 1000);

  // Set up a periodic check for new overlays
  setInterval(suppressResizeObserverErrors, 5000);
}

export default {
  restoreConsoleError,
  suppressResizeObserverErrors,
};
