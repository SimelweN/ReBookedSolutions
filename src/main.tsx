import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";

// Only import CSS in browser environment
if (typeof window !== "undefined") {
  import("./index.css");
}

// Comprehensive environment detection for Workers compatibility
const getEnvironmentInfo = () => {
  try {
    const hasWindow = typeof window !== "undefined";
    const hasDocument = typeof document !== "undefined";
    const hasHTMLElement = typeof HTMLElement !== "undefined";
    const hasReactDOM = typeof ReactDOM !== "undefined";
    const isWorker =
      typeof WorkerGlobalScope !== "undefined" &&
      typeof importScripts === "function";

    return {
      isBrowser: hasWindow && hasDocument && hasHTMLElement && !isWorker,
      isWorker,
      hasReactDOM,
      canRender:
        hasWindow && hasDocument && hasHTMLElement && hasReactDOM && !isWorker,
    };
  } catch {
    return {
      isBrowser: false,
      isWorker: true,
      hasReactDOM: false,
      canRender: false,
    };
  }
};

const env = getEnvironmentInfo();

// Only run React rendering in browser environment
if (env.canRender) {
  try {
    const rootElement = document.getElementById("root");
    if (rootElement) {
      ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
          <App />
        </React.StrictMode>,
      );
    } else {
      console.error("Root element not found");
    }
  } catch (error) {
    console.error("Failed to render app:", error);

    // Fallback: show basic error message
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
      console.error("Fallback rendering also failed:", fallbackError);
    }
  }
} else if (env.isWorker) {
  console.log("Workers environment detected - React rendering skipped");
} else {
  console.log("Non-browser environment detected - React rendering skipped");
}

// Export for static/Workers environments
export default App;
