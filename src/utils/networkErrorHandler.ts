// Network error handler to gracefully handle fetch failures
// Addresses FullStory, Vite client, and other network-related errors

let errorCounts: Record<string, number> = {};
const MAX_ERRORS_PER_SOURCE = 3;
const ERROR_RESET_TIME = 60000; // 1 minute

// Reset error counts periodically
setInterval(() => {
  errorCounts = {};
}, ERROR_RESET_TIME);

export const handleNetworkError = (
  error: Error,
  source: string = "unknown",
) => {
  // Track error counts to prevent spam
  errorCounts[source] = (errorCounts[source] || 0) + 1;

  // Only log first few errors per source
  if (errorCounts[source] <= MAX_ERRORS_PER_SOURCE) {
    console.warn(
      `[${source}] Network error (${errorCounts[source]}/${MAX_ERRORS_PER_SOURCE}):`,
      error.message,
    );

    // Specific handling for known error sources
    if (source.includes("fullstory")) {
      console.warn(
        "FullStory analytics unavailable - continuing without analytics",
      );
    } else if (source.includes("vite") || source.includes("hmr")) {
      console.warn("Vite HMR connection issue - page refresh may be needed");
    } else if (source.includes("supabase")) {
      console.warn("Supabase connection issue - check network and credentials");
    }
  }

  return { handled: true, shouldRetry: errorCounts[source] <= 2 };
};

// Enhanced fetch wrapper with error handling
export const safeFetch = async (
  url: string,
  options: RequestInit = {},
  source: string = "api",
): Promise<Response | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await originalFetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    if (error instanceof Error) {
      handleNetworkError(error, source);
    }
    return null;
  }
};

// Override global fetch to handle FullStory and other third-party errors
const originalFetch = window.fetch;
window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
  try {
    return await originalFetch.call(this, input, init);
  } catch (error) {
    const url = typeof input === "string" ? input : input.toString();

    // Identify error source
    let source = "unknown";
    if (url.includes("fullstory.com") || url.includes("fs.js")) {
      source = "fullstory";
    } else if (url.includes("vite") || url.includes("hmr")) {
      source = "vite-hmr";
    } else if (url.includes("supabase")) {
      source = "supabase";
    }

    if (error instanceof Error) {
      handleNetworkError(error, source);
    }

    // For FullStory errors, silently fail
    if (source === "fullstory") {
      return new Response("{}", { status: 200, statusText: "OK" });
    }

    // Re-throw other errors
    throw error;
  }
};

// Handle WebSocket errors for Vite HMR
let originalWebSocket: typeof WebSocket | undefined;
if (typeof WebSocket !== "undefined") {
  originalWebSocket = WebSocket;

  // @ts-ignore - Override WebSocket constructor
  window.WebSocket = class extends WebSocket {
    constructor(url: string | URL, protocols?: string | string[]) {
      super(url, protocols);

      this.addEventListener("error", (event) => {
        handleNetworkError(
          new Error("WebSocket connection failed"),
          "vite-websocket",
        );
      });

      this.addEventListener("close", (event) => {
        if (event.code !== 1000) {
          // Not a normal closure
          handleNetworkError(
            new Error(`WebSocket closed with code ${event.code}`),
            "vite-websocket",
          );
        }
      });
    }
  };
}

// Cleanup function for development
export const restoreOriginalFetch = () => {
  window.fetch = originalFetch;
  if (originalWebSocket) {
    window.WebSocket = originalWebSocket;
  }
};
