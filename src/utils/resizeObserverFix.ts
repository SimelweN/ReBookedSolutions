/**
 * Utility to suppress ResizeObserver loop errors
 * This is a common issue with UI libraries like Radix UI that use ResizeObserver
 * for positioning and measuring elements.
 */

// Store the original console.error
const originalConsoleError = console.error;

// Override console.error to filter out ResizeObserver errors
console.error = (...args: any[]) => {
  // Check if the error is a ResizeObserver loop error
  if (
    args.length > 0 &&
    typeof args[0] === "string" &&
    args[0].includes(
      "ResizeObserver loop completed with undelivered notifications",
    )
  ) {
    // Suppress this specific error
    return;
  }

  // For all other errors, use the original console.error
  originalConsoleError(...args);
};

// Also handle it as a window error event
window.addEventListener("error", (e) => {
  if (
    e.message &&
    e.message.includes(
      "ResizeObserver loop completed with undelivered notifications",
    )
  ) {
    e.stopImmediatePropagation();
    e.preventDefault();
    return false;
  }
});

// Export a function to restore original console.error if needed
export const restoreConsoleError = () => {
  console.error = originalConsoleError;
};

// Export a function to manually suppress ResizeObserver errors
export const suppressResizeObserverErrors = () => {
  const resizeObserverErrDiv = document.getElementById(
    "webpack-dev-server-client-overlay-div",
  );
  const resizeObserverErr = document.getElementById(
    "webpack-dev-server-client-overlay",
  );

  if (resizeObserverErr) {
    resizeObserverErr.style.display = "none";
  }

  if (resizeObserverErrDiv) {
    resizeObserverErrDiv.style.display = "none";
  }
};

export default {
  restoreConsoleError,
  suppressResizeObserverErrors,
};
