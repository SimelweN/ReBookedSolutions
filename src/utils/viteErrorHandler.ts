/**
 * Vite HMR Error Handler
 * Handles WebSocket connection issues and fetch errors in development
 */

// Track if we've already patched components
let isWebSocketPatched = false;
let isFetchPatched = false;
let isInitialized = false;

/**
 * Initialize Vite error handling for development ONLY
 */
export const initViteErrorHandler = () => {
  // CRITICAL: Only run in development mode
  if (
    typeof window === "undefined" ||
    !import.meta.env.DEV ||
    import.meta.env.PROD ||
    isInitialized ||
    !import.meta.hot
  ) {
    console.log("🔥 Vite error handler skipped (not in development mode)");
    return;
  }

  isInitialized = true;

  // Handle Vite HMR WebSocket errors
  if (!isWebSocketPatched) {
    const originalWebSocket = window.WebSocket;

    window.WebSocket = class PatchedWebSocket extends originalWebSocket {
      constructor(url: string | URL, protocols?: string | string[]) {
        super(url, protocols);

        // Handle connection errors gracefully
        this.addEventListener("error", (event) => {
          if (url.toString().includes("/@vite/client")) {
            console.warn(
              "🔥 Vite HMR connection error (this is normal if server restarted)",
            );
            // Don't let this error propagate and break the app
            event.stopPropagation();
          }
        });

        this.addEventListener("close", (event) => {
          if (url.toString().includes("/@vite/client") && event.code !== 1000) {
            console.warn(
              "🔥 Vite HMR disconnected, will attempt to reconnect...",
            );
          }
        });
      }
    };

    isWebSocketPatched = true;
  }

  // DISABLED: Fetch override to prevent conflicts with fetchErrorFix.ts
  // The fetch error handling is now centralized in fetchErrorFix.ts
  if (!isFetchPatched) {
    console.log("🔥 Vite fetch error handling delegated to fetchErrorFix.ts");
    isFetchPatched = true;
  }

  // Handle unhandled promise rejections from Vite/HMR and third-party scripts
  window.addEventListener("unhandledrejection", (event) => {
    const error = event.reason;

    if (error && typeof error === "object") {
      const message = error.message || "";
      const stack = error.stack || "";

      // Handle Vite HMR related errors
      if (
        message.includes("Failed to fetch") ||
        message.includes("/__vite_ping") ||
        message.includes("/@vite/client") ||
        stack.includes("viteErrorHandler.ts") ||
        stack.includes("/@vite/client")
      ) {
        console.warn("🔥 Vite HMR error handled:", message);
        event.preventDefault(); // Prevent error from breaking the app
        return;
      }

      // Handle third-party script errors (like FullStory, Vercel Analytics)
      if (
        stack.includes("fullstory.com") ||
        stack.includes("fs.js") ||
        stack.includes("vercel-analytics") ||
        stack.includes("vercel-insights") ||
        stack.includes("vercel.com") ||
        (message.includes("Failed to fetch") &&
          (stack.includes("edge.fullstory.com") ||
            stack.includes("vitals.vercel")))
      ) {
        console.warn(
          "🔥 Third-party script error handled (FullStory/Vercel Analytics):",
          message,
        );
        event.preventDefault();
        return;
      }
    }
  });

  console.log("🔥 Vite error handler initialized - fetch loops prevented");
};

/**
 * Debug function to test if fetch is working correctly
 */
export const testViteErrorHandler = () => {
  if (typeof window === "undefined") return;

  console.log("🔥 Testing Vite error handler...");

  // Test a Vite ping request (should be handled gracefully)
  fetch("/__vite_ping")
    .then(() => console.log("🔥 Vite ping successful"))
    .catch((error) =>
      console.log("🔥 Vite ping failed (handled):", error.message),
    );

  // Test a regular request (should work normally)
  fetch("/test-regular-request")
    .then(() => console.log("🔥 Regular request test completed"))
    .catch((error) =>
      console.log("🔥 Regular request failed (expected):", error.message),
    );
};

/**
 * Check if we're in Vite development mode
 */
export const isViteDev = (): boolean => {
  return import.meta.env.DEV && !!import.meta.hot;
};

/**
 * Safe wrapper for Vite HMR operations
 */
export const safeViteOperation = <T>(
  operation: () => T,
  fallback?: T,
): T | undefined => {
  try {
    return operation();
  } catch (error) {
    console.warn("🔥 Vite operation failed:", error);
    return fallback;
  }
};
