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

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <ErrorBoundary level="app">
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
