import "./index.css";
import { ensureReactLoaded } from "./utils/reactLoader";

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

  // Ensure React is loaded first, then load the app
  ensureReactLoaded()
    .then(async (React) => {
      // Load ReactDOM after React is confirmed available
      const ReactDOM = await import("react-dom/client");

      // Now safely import App component
      const AppModule = await import("./App.tsx");
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
          console.log("✅ App rendered successfully");
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
      console.error("Failed to load React or App component:", error);
      try {
        const rootElement = document.getElementById("root");
        if (rootElement) {
          rootElement.innerHTML = `
            <div style="padding: 20px; font-family: Arial, sans-serif;">
              <h1>ReBooked Solutions</h1>
              <p>App failed to load. Please refresh the page.</p>
              <p style="font-size: 12px; color: #666;">Error: ${error instanceof Error ? error.message : "Unknown error"}</p>
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
