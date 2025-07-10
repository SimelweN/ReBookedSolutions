// Import early React setup FIRST to prevent any createContext errors
import "./utils/earlyReactSetup";
import * as React from "react";

// Import React availability check AFTER React is set up
import "./utils/reactAvailabilityCheck";

// Import suppressions
import "./utils/suppressDatadogWarnings";
import "./utils/globalReactSetup";

import { createRoot } from "react-dom/client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";

// Import ResizeObserver error suppression
import "./utils/resizeObserverFix";

// Import third-party error handler
import "./utils/thirdPartyErrorHandler";

// Import safe storage handler
import "./utils/safeStorage";

// Import error fix test (runs automatically in dev)
import "./utils/testErrorFixes";

// Import context validation (runs automatically in dev)
import "./utils/validateContextFixes";

// Import createContext fix summary (runs automatically in dev)
import "./utils/createContextFixSummary";

console.log("🚀 ReBooked Solutions - Starting...");

// Create query client with basic settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Import the simplified App
import App from "./App";

// Get root element
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

try {
  // Create React root
  const root = createRoot(rootElement);

  // Render with error boundary
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </React.StrictMode>,
  );

  console.log("✅ App rendered successfully");
} catch (error) {
  console.error("❌ Failed to render app:", error);

  // Fallback rendering
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif; background: #fee2e2; border: 1px solid #dc2626; border-radius: 8px; margin: 20px;">
      <h1 style="color: #dc2626;">⚠️ Application Error</h1>
      <p>The React application failed to start. Error: ${error.message}</p>
      <p>Please check the browser console for more details.</p>
    </div>
  `;
}
