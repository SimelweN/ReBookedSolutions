/**
 * Vite HMR Error Handler
 * Handles WebSocket connection issues and fetch errors in development
 */

// Track if we've already patched components
let isWebSocketPatched = false;
let isFetchPatched = false;
let isInitialized = false;

/**
 * Initialize Vite error handling for development
 */
export const initViteErrorHandler = () => {
  if (typeof window === "undefined" || !import.meta.env.DEV || isInitialized)
    return;

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

  // Handle fetch errors related to Vite ONLY - with safer implementation
  const originalFetch = window.fetch;
  let isFetchPatched = false;

  if (!isFetchPatched) {
    window.fetch = async function (...args) {
      const url = args[0]?.toString() || "";

      // Only intercept Vite-related requests
      if (
        url.includes("/@vite/") ||
        url.includes("/__vite_ping") ||
        url.includes("/@fs/")
      ) {
        try {
          return await originalFetch.call(window, ...args);
        } catch (error) {
          console.warn(
            "🔥 Vite dev server request failed (server may be restarting):",
            url,
          );
          // Return a fake successful response to prevent app crash
          return new Response("", { status: 200, statusText: "OK" });
        }
      }

      // For non-Vite requests, use original fetch without interception
      return originalFetch.call(window, ...args);
    };

    isFetchPatched = true;
  }

  // Handle unhandled promise rejections from Vite/HMR
  window.addEventListener("unhandledrejection", (event) => {
    const error = event.reason;

    if (error && typeof error === "object") {
      const message = error.message || "";

      // Handle Vite HMR related errors
      if (
        message.includes("Failed to fetch") ||
        message.includes("/__vite_ping") ||
        message.includes("/@vite/client")
      ) {
        console.warn("🔥 Vite HMR error handled:", message);
        event.preventDefault(); // Prevent error from breaking the app
        return;
      }
    }
  });

  console.log("🔥 Vite error handler initialized");
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
