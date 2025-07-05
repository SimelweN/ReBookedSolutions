import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import {
  measureAsyncPerformance,
  logBundleInfo,
} from "./utils/performanceUtils.ts";
import "./index.css";
import "./styles/performance-optimizations.css";
import "./utils/resizeObserverFix";

// Production safety check - ensure React is properly available
if (typeof React === "undefined" || !React.createContext) {
  console.error("🚨 CRITICAL: React is not properly loaded!");
  console.error("This will cause createContext errors in production builds.");

  // Try to recover by reloading the page once
  if (!sessionStorage.getItem("react-reload-attempted")) {
    sessionStorage.setItem("react-reload-attempted", "true");
    window.location.reload();
  } else {
    // If reload didn't help, show emergency fallback
    document.body.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif; text-align: center;">
        <h1>Loading Error</h1>
        <p>The application failed to load properly. Please try refreshing the page.</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; font-size: 16px;">
          Refresh Page
        </button>
      </div>
    `;
    throw new Error("React createContext not available");
  }
}

// Make React globally available for production builds (fallback safety)
if (typeof window !== "undefined") {
  window.React = React;
  // Ensure createContext is also available globally as a fallback
  if (!window.createContext && React.createContext) {
    window.createContext = React.createContext;
  }
}

// Log bundle info in development
logBundleInfo();

// Enhanced environment validation with deployment safety
const validateEnvironment = () => {
  try {
    const hasSupabaseUrl =
      import.meta.env.VITE_SUPABASE_URL &&
      import.meta.env.VITE_SUPABASE_URL.trim() !== "" &&
      import.meta.env.VITE_SUPABASE_URL !== "undefined";

    const hasSupabaseKey =
      import.meta.env.VITE_SUPABASE_ANON_KEY &&
      import.meta.env.VITE_SUPABASE_ANON_KEY.trim() !== "" &&
      import.meta.env.VITE_SUPABASE_ANON_KEY !== "undefined";

    const missing = [];
    if (!hasSupabaseUrl) missing.push("VITE_SUPABASE_URL");
    if (!hasSupabaseKey) missing.push("VITE_SUPABASE_ANON_KEY");

    // In development, we're more lenient
    if (import.meta.env.DEV && missing.length > 0) {
      console.warn(
        "⚠️ Missing Supabase configuration (DEV MODE):",
        missing.join(", "),
      );
      console.warn("⚠�� App will run with limited functionality");
      return { isValid: true, missing, isDev: true };
    }

    if (missing.length > 0) {
      console.warn("⚠️ Missing Supabase configuration:", missing.join(", "));
      return { isValid: false, missing, isDev: false };
    }

    console.log("✅ Environment validation passed");
    return { isValid: true, missing: [], isDev: false };
  } catch (error) {
    console.error("Environment validation error:", error);
    return { isValid: false, missing: ["VALIDATION_ERROR"], isDev: false };
  }
};

// Service Worker Registration
const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator && import.meta.env.PROD) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      console.log("✅ Service Worker registered:", registration.scope);

      // Listen for updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed") {
              if (navigator.serviceWorker.controller) {
                console.log("🔄 New content available, reload to update");
              }
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.warn("⚠️ Service Worker registration failed:", error);
    }
  }
};

// Performance optimizations
const optimizePerformance = () => {
  // Note: CSS is already loaded by Vite, no need to preload manually

  // Add performance observer for Core Web Vitals
  if ("PerformanceObserver" in window) {
    try {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log("📊 LCP:", entry.startTime);
        }
      });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log("📊 FID:", entry.processingStart - entry.startTime);
        }
      });
      fidObserver.observe({ entryTypes: ["first-input"] });

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        console.log("📊 CLS:", clsValue);
      });
      clsObserver.observe({ entryTypes: ["layout-shift"] });
    } catch (error) {
      console.warn("⚠️ Performance Observer not supported");
    }
  }
};

// Initialize application
if (import.meta.env.DEV) {
  console.log("🚀 ReBooked Solutions - Starting application...");
}

// Validate environment with graceful handling
let environmentValidation;
try {
  environmentValidation = validateEnvironment();
} catch (error) {
  console.warn("Environment validation warning:", error);
  environmentValidation = {
    isValid: false,
    missing: ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"],
  };
}

// Create optimized query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: unknown) => {
        // Don't retry on 4xx errors
        if (error && typeof error === "object" && "status" in error) {
          const status = (error as { status: number }).status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});

// Initialize the React app with enhanced error handling
const initializeApp = async () => {
  return measureAsyncPerformance("AppInitialization", async () => {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error("Root element #root not found in DOM");
    }

    const root = createRoot(rootElement);

    // Apply performance optimizations
    optimizePerformance();

    // Register service worker
    await registerServiceWorker();

    // Environment error component disabled for production

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
  });
};

// Main execution with comprehensive error handling
try {
  initializeApp().catch((error) => {
    console.error("❌ Critical error during app initialization:", error);
    throw error;
  });
} catch (error) {
  console.error("�� Critical error during app initialization:", error);

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
            If this problem persists, contact: info@rebookedsolutions.co.za
          </div>
        </div>
      </div>
    `;
  }
}
