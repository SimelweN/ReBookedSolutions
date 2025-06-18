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
  import("./utils/connectionHealthCheck").then(({ logConnectionHealth }) => {
    logConnectionHealth();
  });

  // Analyze bundle size
  setTimeout(() => {
    analyzeBundleSize();
  }, 1000);
}

// Initialize performance monitoring
initCoreWebVitals();

// Initialize security measures
initSecurity();

// Performance optimizations are handled by performanceUtils

// Create a client with improved error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error && typeof error === "object" && "status" in error) {
          const status = (error as { status: number }).status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false, // Don't retry mutations by default
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
