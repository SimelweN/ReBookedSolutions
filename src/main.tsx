import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import { validateEnvironment } from "./config/environment";
import { initCoreWebVitals, analyzeBundleSize } from "./utils/performanceUtils";
import { initSecurity } from "./utils/securityUtils";
import "./index.css";

// Validate environment variables before starting the app
try {
  validateEnvironment();
  console.log("✅ Environment validation passed");
} catch (error) {
  console.warn("⚠️ Environment validation failed, using fallbacks:", error);
  // Don't throw - continue with fallback values for development
}

// Development-only utilities
if (import.meta.env.DEV) {
  console.log("🚀 Development mode - app starting...");
}

// Initialize performance monitoring (simplified)
try {
  initCoreWebVitals();
} catch (error) {
  console.warn("Performance monitoring failed:", error);
}

// Initialize security measures (simplified)
try {
  initSecurity();
} catch (error) {
  console.warn("Security initialization failed:", error);
}

// Performance optimizations are handled by performanceUtils

// Create a simple query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1, // Simple retry
    },
    mutations: {
      retry: false,
    },
  },
});

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }

  const root = createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <ErrorBoundary level="app">
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>,
  );

  console.log("✅ React app mounted successfully");
} catch (error) {
  console.error("❌ Failed to mount React app:", error);

  // Fallback: show basic HTML content
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui;">
        <div style="text-align: center; padding: 2rem;">
          <h1 style="color: #dc2626; margin-bottom: 1rem;">App Loading Failed</h1>
          <p style="margin-bottom: 1rem;">Please refresh the page or check the console for details.</p>
          <button onclick="window.location.reload()" style="background: #3b82f6; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer;">
            Refresh Page
          </button>
        </div>
      </div>
    `;
  }
}
