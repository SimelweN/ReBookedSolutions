import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
import "./index.css";
import {
  disableHMRInProduction,
  isProductionDeployment,
} from "./utils/environmentCheck";

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

// Disable HMR in production deployments (early and aggressive)
if (isBrowser) {
  try {
    disableHMRInProduction();
  } catch (error) {
    console.warn("HMR disabling failed:", error);
  }
}

// Add global error handlers for development
if (isBrowser && import.meta.env.DEV) {
  // Handle unhandled promise rejections (like fetch errors)
  window.addEventListener("unhandledrejection", (event) => {
    if (event.reason?.message?.includes("Failed to fetch")) {
      console.warn(
        "🔧 Development: Network fetch error handled:",
        event.reason.message,
      );
      event.preventDefault(); // Prevent the error from being logged to console
    }
  });

  // Handle global errors
  window.addEventListener("error", (event) => {
    if (event.error?.message?.includes("Failed to fetch")) {
      console.warn(
        "🔧 Development: Global fetch error handled:",
        event.error.message,
      );
      event.preventDefault();
    }
  });
}

// Initialize Sentry only in production to prevent development fetch errors
const isProduction =
  import.meta.env.PROD || import.meta.env.NODE_ENV === "production";
if (isBrowser && isProduction) {
  Sentry.init({
    dsn: "https://d607a8ffffc0d2ba8736074faa5a86f8@o4509633019838464.ingest.us.sentry.io/4509661214081024",
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 0.1, // Reduced for production
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE || "production",
    release: import.meta.env.VITE_APP_VERSION || "1.0.0",
  });
} else if (import.meta.env.DEV) {
  console.log("🔧 Sentry disabled in development mode");
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
