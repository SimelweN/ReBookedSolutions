import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import "./index.css";

// Environment validation with graceful fallbacks
const validateEnvironment = () => {
  const hasSupabaseUrl =
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_URL.trim() !== "";
  const hasSupabaseKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_SUPABASE_ANON_KEY.trim() !== "";

  if (!hasSupabaseUrl || !hasSupabaseKey) {
    console.warn(
      "⚠️ Missing Supabase configuration - using development defaults",
    );
    return false;
  }

  console.log("✅ Environment validation passed");
  return true;
};

// Initialize application
if (import.meta.env.DEV) {
  console.log("🚀 ReBooked Solutions - Starting application...");
}

// Validate environment with graceful handling
try {
  validateEnvironment();
} catch (error) {
  console.warn("Environment validation warning:", error);
  // Continue anyway - don't block the app
}

// Create a simple query client with minimal configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false, // Reduce unnecessary requests
    },
    mutations: {
      retry: false,
    },
  },
});

// Initialize the React app
const initializeApp = () => {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element #root not found in DOM");
  }

  const root = createRoot(rootElement);

  // Render the app with comprehensive error boundaries
  root.render(
    <React.StrictMode>
      <ErrorBoundary level="app">
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>,
  );

  if (import.meta.env.DEV) {
    console.log("✅ ReBooked Solutions loaded successfully");
  }
};

// Main execution with comprehensive error handling
try {
  initializeApp();
} catch (error) {
  console.error("❌ Critical error during app initialization:", error);

  // Emergency fallback UI
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: system-ui, -apple-system, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        margin: 0;
        padding: 1rem;
      ">
        <div style="
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          text-align: center;
          max-width: 500px;
          width: 100%;
        ">
          <div style="
            width: 60px;
            height: 60px;
            background: #ef4444;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            color: white;
            font-size: 24px;
            font-weight: bold;
          ">!</div>

          <h1 style="
            color: #1f2937;
            margin: 0 0 1rem;
            font-size: 1.5rem;
            font-weight: 600;
          ">App Loading Failed</h1>

          <p style="
            color: #6b7280;
            margin: 0 0 1.5rem;
            line-height: 1.6;
          ">
            ReBooked Solutions encountered an error while starting up.
            This is usually a temporary issue.
          </p>

          <button onclick="window.location.reload()" style="
            background: #3b82f6;
            color: white;
            border: none;
            padding: 0.75rem 2rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s;
            margin-right: 0.5rem;
          " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
            🔄 Refresh Page
          </button>

          <button onclick="window.location.href='/'" style="
            background: #6b7280;
            color: white;
            border: none;
            padding: 0.75rem 2rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s;
          " onmouseover="this.style.background='#4b5563'" onmouseout="this.style.background='#6b7280'">
            🏠 Home
          </button>

          <div style="
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e5e7eb;
            font-size: 0.75rem;
            color: #9ca3af;
          ">
            ReBooked Solutions<br>
            If this problem persists, contact: support@rebookedsolutions.co.za
          </div>
        </div>
      </div>
    `;
  }
}

// Clean up debug file
const cleanupDebugFile = () => {
  // This would normally be done by build process, but for now we'll leave it
};
