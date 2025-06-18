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
  console.log("📊 Environment:", {
    NODE_ENV: import.meta.env.NODE_ENV,
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? "SET" : "NOT SET",
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY
      ? "SET"
      : "NOT SET",
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  });
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
  console.log("🔍 Starting React mount process...");

  const rootElement = document.getElementById("root");
  console.log("📍 Root element:", rootElement);

  if (!rootElement) {
    throw new Error("Root element not found");
  }

  console.log("🏗️ Creating React root...");
  const root = createRoot(rootElement);
  console.log("✅ React root created successfully");

  console.log("🎨 Rendering React app...");
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

  // Add a timeout check to see if content actually appears
  setTimeout(() => {
    const content = document.querySelector("#root > *");
    if (!content) {
      console.warn(
        "⚠️ WARNING: React app mounted but no content rendered after 2 seconds",
      );
      console.log("📊 Root element children:", rootElement.children.length);
      console.log(
        "📊 Root element innerHTML length:",
        rootElement.innerHTML.length,
      );
    } else {
      console.log("✅ Content successfully rendered");
    }
  }, 2000);
} catch (error) {
  console.error("❌ Failed to mount React app:", error);
  console.error("❌ Error details:", {
    message: error instanceof Error ? error.message : "Unknown error",
    stack: error instanceof Error ? error.stack : "No stack trace",
    name: error instanceof Error ? error.name : "Unknown error type",
  });

  // Fallback: show basic HTML content
  const rootElement = document.getElementById("root");
  if (rootElement) {
    console.log("🔧 Showing fallback content");
    rootElement.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui; background: #f9fafb;">
        <div style="text-align: center; padding: 2rem; max-width: 500px; background: white; border-radius: 0.5rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
          <h1 style="color: #dc2626; margin-bottom: 1rem; font-size: 1.5rem;">App Loading Failed</h1>
          <p style="margin-bottom: 1rem; color: #6b7280;">The React app failed to load. This might be due to a JavaScript error or missing dependencies.</p>
          <p style="margin-bottom: 1.5rem; font-size: 0.875rem; color: #6b7280;">Check the browser console (F12) for detailed error information.</p>
          <button onclick="window.location.reload()" style="background: #3b82f6; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 0.875rem; font-weight: 500;">
            Refresh Page
          </button>
          <p style="margin-top: 1rem; font-size: 0.75rem; color: #9ca3af;">ReBooked Solutions</p>
        </div>
      </div>
    `;
  } else {
    console.error("❌ Root element not found for fallback content");
  }
}
