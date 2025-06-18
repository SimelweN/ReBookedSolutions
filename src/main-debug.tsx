import React from "react";
import { createRoot } from "react-dom/client";

console.log("🚀 Starting minimal debug version...");

// Simple test component
const TestApp = () => {
  console.log("🎯 TestApp rendering...");
  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "system-ui",
        background: "#f9fafb",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "0.5rem",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#059669", marginBottom: "1rem" }}>
          ✅ React is Working!
        </h1>
        <p style={{ color: "#6b7280", marginBottom: "1rem" }}>
          This confirms that React can render. The issue is likely in the main
          app components.
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          style={{
            background: "#3b82f6",
            color: "white",
            padding: "0.75rem 1.5rem",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
          }}
        >
          Go to Main App
        </button>
      </div>
    </div>
  );
};

try {
  console.log("🔍 Looking for root element...");
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    console.error("❌ Root element not found!");
    throw new Error("Root element not found");
  }

  console.log("✅ Root element found:", rootElement);
  console.log("🏗️ Creating React root...");

  const root = createRoot(rootElement);
  console.log("✅ React root created");

  console.log("🎨 Rendering test app...");
  root.render(<TestApp />);

  console.log("✅ Test app rendered successfully!");
} catch (error) {
  console.error("❌ Error in debug version:", error);

  // Fallback HTML
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 2rem; font-family: system-ui; text-align: center;">
        <h1 style="color: #dc2626;">Even the debug version failed!</h1>
        <p>This indicates a serious issue. Check console for details.</p>
        <pre style="background: #f3f4f6; padding: 1rem; text-align: left;">${error}</pre>
      </div>
    `;
  }
}
