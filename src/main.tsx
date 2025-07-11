import * as React from "react";

// Note: Datadog warning suppression removed as SDK is not actually installed

import { createRoot } from "react-dom/client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";

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
import { initDatabaseStatusCheck } from "./utils/databaseConnectivityHelper";

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
  console.error("�� Failed to render app:", error);

  // Fallback rendering
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif; background: #fee2e2; border: 1px solid #dc2626; border-radius: 8px; margin: 20px;">
      <h1 style="color: #dc2626;">⚠️ Application Error</h1>
      <p>The React application failed to start. Error: ${error.message}</p>
      <p>Please check the browser console for more details.</p>
    </div>
  `;
}
