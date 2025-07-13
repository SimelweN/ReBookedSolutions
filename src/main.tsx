import React from "react";
import ReactDOM from "react-dom/client";
import "react/jsx-runtime";
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

// Only execute React app in browser environment
if (isBrowser) {
  // Initialize services synchronously to avoid circular dependencies
  try {
    // Import console interceptor if available
    if (import.meta.env.DEV) {
      import("./services/consoleInterceptor").catch(() => {
        // Silent catch - not critical for app function
      });
    }
  } catch {
    // Silent catch - not critical
  }

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
        console.log("✅ App rendered successfully");
      }
    } else {
      console.error("Root element not found");
    }
  } catch (error) {
    console.error("Failed to render app:", error);
    // Fallback rendering
    try {
      const rootElement = document.getElementById("root");
      if (rootElement) {
        rootElement.innerHTML = `
          <div style="padding: 20px; font-family: Arial, sans-serif;">
            <h1>ReBooked Solutions</h1>
            <p>Loading issue detected. Please refresh the page.</p>
            <p style="font-size: 12px; color: #666;">Error: ${error instanceof Error ? error.message : "Unknown error"}</p>
          </div>
        `;
      }
    } catch (fallbackError) {
      console.error("Fallback rendering failed:", fallbackError);
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
