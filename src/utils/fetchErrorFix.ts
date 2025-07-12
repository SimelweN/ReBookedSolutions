// Targeted fix for fetch errors without global overrides
// This prevents conflicts between multiple fetch interceptors

let isFixApplied = false;

export const applyFetchErrorFix = () => {
  if (isFixApplied || typeof window === "undefined") return;

  // Store original implementations
  const originalFetch = window.fetch;
  const originalWebSocket = window.WebSocket;

  // Simple error handler that doesn't override global fetch
  const handleFetchError = (error: Error, url: string) => {
    // Silently handle FullStory errors
    if (
      url.includes("fullstory.com") ||
      url.includes("fs.js") ||
      url.includes("edge.fullstory.com")
    ) {
      console.warn(
        "FullStory analytics unavailable - continuing without analytics",
      );
      return { shouldSuppress: true };
    }

    // Handle Vite HMR ping errors gracefully
    if (url.includes("__vite_ping") || url.includes("/@vite/client")) {
      console.warn("Vite HMR ping failed - this is normal in production");
      return { shouldSuppress: true };
    }

    return { shouldSuppress: false };
  };

  // Add error listener for unhandled errors
  window.addEventListener("error", (event) => {
    const error = event.error;
    if (error && error.message && error.message.includes("Failed to fetch")) {
      // Check if this is a known problematic fetch
      const url = error.stack || "";
      const result = handleFetchError(error, url);

      if (result.shouldSuppress) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    }
  });

  // Add unhandledrejection listener for Promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    const error = event.reason;
    if (error && error.message && error.message.includes("Failed to fetch")) {
      const url = error.stack || "";
      const result = handleFetchError(error, url);

      if (result.shouldSuppress) {
        event.preventDefault();
        return false;
      }
    }
  });

  // Remove problematic FullStory scripts
  const removeFullStoryScripts = () => {
    const scripts = document.querySelectorAll(
      'script[src*="fullstory"], script[src*="fs.js"]',
    );
    scripts.forEach((script) => {
      console.warn("Removing problematic FullStory script");
      script.remove();
    });
  };

  // Clean up immediately and periodically
  removeFullStoryScripts();
  const cleanupInterval = setInterval(removeFullStoryScripts, 10000);

  // Cleanup function
  const cleanup = () => {
    clearInterval(cleanupInterval);
    isFixApplied = false;
  };

  isFixApplied = true;
  return cleanup;
};

// Auto-apply the fix
if (typeof window !== "undefined") {
  applyFetchErrorFix();
}
