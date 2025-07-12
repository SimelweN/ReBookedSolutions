// Smart entry point that adapts to the environment
// Uses different implementations for browser vs Workers

// Environment detection
const isBrowser = (function () {
  try {
    return (
      typeof window !== "undefined" &&
      typeof document !== "undefined" &&
      typeof navigator !== "undefined"
    );
  } catch (e) {
    return false;
  }
})();

const isWorker = (function () {
  try {
    return (
      typeof WorkerGlobalScope !== "undefined" ||
      typeof importScripts === "function" ||
      (typeof self !== "undefined" && typeof window === "undefined")
    );
  } catch (e) {
    return false;
  }
})();

// Browser implementation
if (isBrowser) {
  // Use the main.js implementation for browsers
  import("./main.js")
    .then(function (module) {
      // Main.js handles the browser case
    })
    .catch(function (error) {
      console.error("Failed to load browser implementation:", error);
    });
}

// Workers implementation
if (isWorker) {
  // Use minimal Workers implementation
  import("./workers-main.js")
    .then(function (module) {
      console.log("Workers implementation loaded");
    })
    .catch(function (error) {
      console.error("Failed to load Workers implementation:", error);
    });
}

// Default export for static analysis
export default function SmartMain() {
  if (isBrowser) {
    return "Browser mode";
  } else if (isWorker) {
    return "Workers mode";
  } else {
    return "Unknown environment";
  }
}
