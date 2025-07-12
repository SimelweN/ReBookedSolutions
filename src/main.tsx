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
  // Apply targeted fetch error fix
  import("./utils/fetchErrorFix").catch(console.warn);

  // Dynamically import React first to ensure it's available globally
  Promise.all([import("react"), import("react-dom/client")])
    .then(([React, ReactDOM]) => {
      // Make React available globally before importing components
      if (typeof window !== "undefined") {
        (window as any).React = React;
        (window as any).ReactDOM = ReactDOM;
      }

      // Now safely import App component
      return import("./App.tsx").then((AppModule) => {
        const App = AppModule.default;
        try {
          const rootElement = document.getElementById("root");
          if (rootElement) {
            const root = ReactDOM.createRoot(rootElement);
            root.render(
              React.createElement(
                React.StrictMode,
                null,
                React.createElement(App),
              ),
            );
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
      });
    })
    .catch((error) => {
      console.error("Failed to load React or App component:", error);
      try {
        const rootElement = document.getElementById("root");
        if (rootElement) {
          rootElement.innerHTML = `
            <div style="padding: 20px; font-family: Arial, sans-serif;">
              <h1>ReBooked Solutions</h1>
              <p>App failed to load. Please refresh the page.</p>
            </div>
          `;
        }
      } catch (fallbackError) {
        console.error("Complete fallback failed:", fallbackError);
      }
    });
} else {
  console.log("Non-browser environment detected - React rendering skipped");
}

// Export minimal function for Workers/static environments
export default function WorkersApp() {
  return "ReBooked Solutions - Workers Compatible Build";
}
