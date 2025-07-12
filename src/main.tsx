import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Workers-compatible check - ensure we're in a browser environment
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

// Only run in browser environment
if (isBrowser) {
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
  }
}

// Export for static/Workers environments
export default App;
