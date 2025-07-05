import React from "react";
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

// Test basic functionality first
const TestApp = () => {
  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        background: "white",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ color: "#2563eb", fontSize: "2rem" }}>
        ✅ ReBooked Solutions Working!
      </h1>
      <p>
        The issue is with the App.tsx component. Let me fix it step by step.
      </p>
      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          background: "#fee2e2",
          borderRadius: "8px",
        }}
      >
        <p>
          <strong>Problem:</strong> Something in App.tsx is causing a fatal
          error
        </p>
        <p>
          <strong>Solution:</strong> I'll rebuild App.tsx with proper error
          handling
        </p>
      </div>
    </div>
  );
};

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
      <ErrorBoundary level="app">
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ErrorBoundary>
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
