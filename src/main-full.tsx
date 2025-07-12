import * as React from "react";

// Note: Datadog warning suppression removed as SDK is not actually installed

import { createRoot } from "react-dom/client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Only import CSS in browser environment
if (typeof window !== "undefined") {
  import("./index.css");
}

// Import the simplified App
import App from "./App";
import { initDatabaseStatusCheck } from "./utils/databaseConnectivityHelper";

// Workers-compatible check - more comprehensive
const isBrowser =
  typeof window !== "undefined" &&
  typeof document !== "undefined" &&
  typeof navigator !== "undefined";

// Only run in browser environment
if (isBrowser) {
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

    // Initialize database status check in development
    initDatabaseStatusCheck();
  } catch (error) {
    console.error("❌ Failed to render app:", error);

    // Fallback rendering
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif; background: #fee2e2; border: 1px solid #dc2626; border-radius: 8px; margin: 20px;">
        <h1 style="color: #dc2626;">⚠️ Application Error</h1>
        <p>The React application failed to start. Error: ${error instanceof Error ? error.message : String(error)}</p>
        <p>Please check the browser console for more details.</p>
      </div>
    `;
  }
}

// Export App for static generation/Workers environments
export default App;

// Workers-specific fallback
export const handleWorkerRequest = () => {
  return {
    status: 200,
    body: "React App - Workers environment detected",
    headers: { "Content-Type": "text/plain" },
  };
};

// Prevent any immediate execution in Workers
if (
  typeof WorkerGlobalScope !== "undefined" &&
  typeof self !== "undefined" &&
  typeof window === "undefined"
) {
  // We're in a Worker environment, export handler only
  console.log("Workers environment detected");
}
