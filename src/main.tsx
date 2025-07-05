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

// Step 1: Test with simple routing
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const SimpleHome = () => (
  <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
    <h1 style={{ color: "#2563eb" }}>🏠 ReBooked Solutions - Home</h1>
    <p>✅ Basic routing is working!</p>
    <nav style={{ marginTop: "20px" }}>
      <a href="/books" style={{ marginRight: "20px", color: "#2563eb" }}>
        Books
      </a>
      <a href="/login" style={{ color: "#2563eb" }}>
        Login
      </a>
    </nav>
  </div>
);

const SimpleBooks = () => (
  <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
    <h1 style={{ color: "#2563eb" }}>📚 Books Page</h1>
    <p>✅ Books route is working!</p>
    <a href="/" style={{ color: "#2563eb" }}>
      ← Back to Home
    </a>
  </div>
);

const SimpleLogin = () => (
  <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
    <h1 style={{ color: "#2563eb" }}>🔐 Login Page</h1>
    <p>✅ Login route is working!</p>
    <a href="/" style={{ color: "#2563eb" }}>
      ← Back to Home
    </a>
  </div>
);

const SimpleApp = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SimpleHome />} />
        <Route path="/books" element={<SimpleBooks />} />
        <Route path="/login" element={<SimpleLogin />} />
      </Routes>
    </Router>
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
        <SimpleApp />
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
