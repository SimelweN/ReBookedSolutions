// Simple deployment safety utilities
// Prevents blank screens and provides fallbacks

export const deploymentSafety = {
  // Handle chunk loading errors (common during deployments)
  handleChunkError: () => {
    let reloadCount = 0;
    const maxReloads = 3;

    const handleError = (event: ErrorEvent) => {
      const { message, filename } = event;

      if (
        message?.includes("Loading chunk") ||
        message?.includes("Unexpected token") ||
        filename?.includes(".js")
      ) {
        reloadCount++;
        if (reloadCount <= maxReloads) {
          console.warn(
            `Chunk loading error detected, reloading page... (${reloadCount}/${maxReloads})`,
          );
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          console.error(
            "Multiple reload attempts failed, stopping auto-reload",
          );
        }
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.toString() || "";

      if (
        reason.includes("Loading chunk") ||
        reason.includes("Failed to fetch")
      ) {
        reloadCount++;
        if (reloadCount <= maxReloads) {
          console.warn(
            `Promise rejection detected, reloading page... (${reloadCount}/${maxReloads})`,
          );
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
  },

  // Initialize basic safety measures
  init: () => {
    try {
      deploymentSafety.handleChunkError();
      console.log("Deployment safety initialized");
    } catch (error) {
      console.warn("Deployment safety initialization failed:", error);
    }
  },
};

// Auto-initialize if we're in the browser
if (typeof window !== "undefined") {
  deploymentSafety.init();
}
