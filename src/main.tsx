// Ultra-minimal Workers-compatible entry point
// Avoid ALL static imports that could cause Workers build issues

// Only execute browser code when actually in browser
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

// Only load React and other dependencies in browser environment
if (isBrowser) {
  // Initialize network error handling and cleanup problematic scripts early
  import("./utils/networkErrorHandler").catch(console.warn);
  import("./utils/cleanupThirdPartyScripts").catch(console.warn);

  // Dynamic imports to prevent any static analysis issues in Workers builds
  Promise.all([
    import("react"),
    import("react-dom/client"),
    import("./index.css"),
  ])
    .then(([React, ReactDOM]) => {
      // Now dynamically import the App component
      import("./App.tsx")
        .then((AppModule) => {
          const App = AppModule.default;
          try {
            const rootElement = document.getElementById("root");
            if (rootElement) {
              ReactDOM.createRoot(rootElement).render(
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
        })
        .catch((error) => {
          console.error("Failed to load App component:", error);
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
    })
    .catch((error) => {
      console.error("Failed to load React dependencies:", error);
    });
} else {
  console.log("Non-browser environment detected - React rendering skipped");
}

// Export minimal function for Workers/static environments
export default function WorkersApp() {
  return "ReBooked Solutions - Workers Compatible Build";
}
