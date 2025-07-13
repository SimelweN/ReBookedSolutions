import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
import "./index.css";

// Define browser environment check
const isBrowser = (() => {
  try {
    return (
      typeof window !== "undefined" &&
      typeof document !== "undefined" &&
      typeof HTMLElement !== "undefined"
    );
  } catch {
    return false;
  }
})();

// Initialize Sentry as early as possible in browser environment
if (isBrowser) {
  Sentry.init({
    dsn: "https://d607a8ffffc0d2ba8736074faa5a86f8@o4509633019838464.ingest.us.sentry.io/4509661214081024",
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    // Tracing
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
    // Environment configuration
    environment: import.meta.env.MODE || "development",
    // Release tracking
    release: import.meta.env.VITE_APP_VERSION || "1.0.0",
    // Additional configuration for better debugging
    beforeSend(event) {
      // Filter out non-critical errors in development
      if (import.meta.env.MODE !== "production") {
        console.log("Sentry event:", event);
      }
      return event;
    },
  });
}

// Only execute React app in browser environment
if (isBrowser) {
  try {
    const rootElement = document.getElementById("root");
    if (rootElement) {
      const root = ReactDOM.createRoot(rootElement);
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>,
      );
      if (import.meta.env.MODE !== "production") {
        console.log("✅ App rendered successfully with Sentry monitoring");
      }
    } else {
      console.error("Root element not found");
      // Report to Sentry
      Sentry.captureMessage(
        "Root element not found during app initialization",
        "error",
      );
    }
  } catch (error) {
    console.error("Failed to render app:", error);
    // Report to Sentry
    Sentry.captureException(error);

    // Fallback rendering
    try {
      const rootElement = document.getElementById("root");
      if (rootElement) {
        rootElement.innerHTML = `
          <div style="padding: 20px; font-family: Arial, sans-serif;">
            <h1>ReBooked Solutions</h1>
            <p>Loading issue detected. Please refresh the page.</p>
            <p style="font-size: 12px; color: #666;">Error: ${error instanceof Error ? error.message : "Unknown error"}</p>
            <p style="font-size: 12px; color: #666;">This error has been reported to our monitoring system.</p>
          </div>
        `;
      }
    } catch (fallbackError) {
      console.error("Fallback rendering failed:", fallbackError);
      Sentry.captureException(fallbackError);
    }
  }
} else {
  if (import.meta.env.MODE !== "production") {
    console.log("Non-browser environment detected - React rendering skipped");
  }
}

// Export minimal function for Workers/static environments
export default function WorkersApp() {
  return "ReBooked Solutions - Workers Compatible Build";
}
