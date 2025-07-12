/**
 * Suppress Datadog Browser SDK Warnings
 * This file should be imported as early as possible to suppress console warnings
 */

// Only run in browser environment
if (typeof window !== "undefined" && typeof console !== "undefined") {
  // Store original console methods
  const originalWarn = console.warn;
  const originalLog = console.log;
  const originalError = console.error;

  // Override console.warn to filter Datadog messages
  console.warn = function (...args: any[]) {
    const message = args.join(" ");

    // Filter out Datadog storage warnings
    if (
      message.includes("Datadog Browser SDK") &&
      (message.includes("No storage available") ||
        message.includes("session") ||
        message.includes("not send any data"))
    ) {
      // Silently ignore Datadog storage warnings
      return;
    }

    originalWarn.apply(this, args);
  };

  // Override console.log to filter Datadog messages
  console.log = function (...args: any[]) {
    const message = args.join(" ");

    if (
      message.includes("Datadog Browser SDK") &&
      message.includes("storage")
    ) {
      return;
    }

    originalLog.apply(this, args);
  };

  // Override console.error to filter Datadog errors
  console.error = function (...args: any[]) {
    const message = args.join(" ");

    if (message.includes("Datadog Browser SDK")) {
      console.debug("🔇 Suppressed Datadog error:", message.substring(0, 100));
      return;
    }

    originalError.apply(this, args);
  };

  console.debug("🔇 Datadog warning suppression active");
}
