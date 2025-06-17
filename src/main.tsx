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
} catch (error) {
  console.error("🚨 CRITICAL ERROR: Environment validation failed:", error);

  // Show user-friendly error message in the DOM
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: #f8fafc;
        color: #1e293b;
        padding: 2rem;
        text-align: center;
      ">
        <div style="
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          max-width: 600px;
        ">
          <h1 style="color: #dc2626; margin-bottom: 1rem;">⚠️ Configuration Error</h1>
          <p style="margin-bottom: 1rem; line-height: 1.6;">
            The application cannot start because required environment variables are missing.
          </p>
          <pre style="
            background: #f1f5f9;
            padding: 1rem;
            border-radius: 4px;
            text-align: left;
            overflow: auto;
            font-size: 0.875rem;
            margin: 1rem 0;
          ">${error instanceof Error ? error.message : String(error)}</pre>
          <p style="color: #64748b; font-size: 0.875rem;">
            If you're a developer, check the console for more details.
          </p>
        </div>
      </div>
    `;
  }

  // Stop execution - don't continue with the broken app
  throw error;
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
