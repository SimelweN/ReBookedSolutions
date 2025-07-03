/**
 * Production Error Handler
 * Handles errors gracefully in production without interfering with third-party scripts
 */

let isInitialized = false;

/**
 * Initialize production error handling
 */
export const initProductionErrorHandler = () => {
  if (isInitialized || typeof window === "undefined" || import.meta.env.DEV) {
    return;
  }

  isInitialized = true;

  // Handle unhandled promise rejections gracefully
  window.addEventListener("unhandledrejection", (event) => {
    const error = event.reason;

    if (error && typeof error === "object") {
      const message = error.message || "";
      const stack = error.stack || "";

      // Only handle specific known issues that shouldn't break the app
      if (
        // FullStory analytics errors
        stack.includes("fullstory.com") ||
        stack.includes("fs.js") ||
        // Vercel analytics errors
        stack.includes("vercel-analytics") ||
        stack.includes("vercel-insights") ||
        stack.includes("vitals.vercel") ||
        // Generic third-party fetch errors
        (message.includes("Failed to fetch") &&
          (stack.includes("edge.fullstory.com") ||
            stack.includes("vercel.com")))
      ) {
        console.warn(
          "🔧 Third-party service error handled gracefully:",
          message,
        );
        event.preventDefault();
        return;
      }
    }

    // Let other errors through for proper error reporting
  });

  // Handle global errors from third-party scripts
  window.addEventListener("error", (event) => {
    const error = event.error;
    const source = event.filename || "";

    // Handle third-party script errors
    if (
      source.includes("fullstory.com") ||
      source.includes("vercel.com") ||
      (error && error.message && error.message.includes("Script error"))
    ) {
      console.warn("🔧 Third-party script error handled:", event.message);
      event.preventDefault();
      return true;
    }

    // Let application errors through for proper error reporting
    return false;
  });

  console.log("✅ Production error handler initialized");
};

// Initialize immediately in production
if (import.meta.env.PROD && typeof window !== "undefined") {
  initProductionErrorHandler();
}
