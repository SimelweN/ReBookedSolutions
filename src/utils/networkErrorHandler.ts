/**
 * Network Error Handler
 * Fixes issues with third-party services interfering with fetch API
 */

let originalFetch: typeof fetch;
let isInitialized = false;

// Store the original fetch before any third-party scripts can override it
if (typeof window !== "undefined" && window.fetch) {
  originalFetch = window.fetch.bind(window);
}

/**
 * Initialize network error handling
 */
export const initNetworkErrorHandler = () => {
  if (isInitialized || typeof window === "undefined") return;

  // Only restore fetch in development - in production, let third-party scripts work
  if (import.meta.env.DEV && originalFetch && window.fetch !== originalFetch) {
    console.warn(
      "⚠️ Fetch API has been overridden by third-party script, restoring original (DEV only)",
    );
    window.fetch = originalFetch;
  }

  // Add global error handlers for network issues
  window.addEventListener("unhandledrejection", (event) => {
    if (
      event.reason &&
      event.reason.message &&
      event.reason.message.includes("Failed to fetch")
    ) {
      console.warn(
        "🌐 Network error caught and handled:",
        event.reason.message,
      );
      // Prevent the error from bubbling up and breaking the app
      event.preventDefault();
    }
  });

  // Handle WebSocket connection errors for Vite HMR
  const originalWebSocket = window.WebSocket;
  window.WebSocket = class extends originalWebSocket {
    constructor(url: string | URL, protocols?: string | string[]) {
      super(url, protocols);

      this.addEventListener("error", (event) => {
        console.warn("🔌 WebSocket connection error (likely HMR):", event);
      });

      this.addEventListener("close", (event) => {
        if (event.code !== 1000) {
          console.warn(
            "🔌 WebSocket closed unexpectedly:",
            event.code,
            event.reason,
          );
        }
      });
    }
  };

  isInitialized = true;
  console.log("✅ Network error handler initialized");
};

/**
 * Robust fetch wrapper that handles network errors gracefully
 */
export const robustFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  try {
    // Use original fetch if available
    const fetchFn = originalFetch || window.fetch;
    const response = await fetchFn(input, init);
    return response;
  } catch (error) {
    console.warn("🌐 Fetch error caught:", error);

    // If it's a network error, throw a more specific error
    if (
      error instanceof TypeError &&
      error.message.includes("Failed to fetch")
    ) {
      throw new Error(
        "Network connection failed. Please check your internet connection.",
      );
    }

    throw error;
  }
};

/**
 * Debounced network check to prevent spam
 */
let networkCheckTimeout: NodeJS.Timeout;
export const debouncedNetworkCheck = () => {
  clearTimeout(networkCheckTimeout);
  networkCheckTimeout = setTimeout(() => {
    if (navigator.onLine === false) {
      console.warn("🔴 Device appears to be offline");
    }
  }, 1000);
};

// Initialize on import if in browser environment
if (typeof window !== "undefined") {
  // Use a small delay to ensure the page has loaded
  setTimeout(initNetworkErrorHandler, 100);
}
