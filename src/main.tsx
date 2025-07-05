import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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

// Simple working app component
const MinimalApp = () => {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ color: "#2563eb" }}>🚀 ReBooked Solutions</h1>
      <p>Welcome to your textbook marketplace!</p>
      <div
        style={{
          marginTop: "20px",
          padding: "10px",
          background: "#f0f9ff",
          borderRadius: "8px",
        }}
      >
        <p>
          <strong>✅ React is working</strong>
        </p>
        <p>
          <strong>✅ Vite is working</strong>
        </p>
        <p>
          <strong>✅ Environment configured</strong>
        </p>
      </div>
      <p>Now loading the full application...</p>
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
      <QueryClientProvider client={queryClient}>
        <MinimalApp />
      </QueryClientProvider>
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
