import React from "react";
import { createRoot } from "react-dom/client";

// EMERGENCY DEBUG MODE - Minimal React Test
console.log("🔥 EMERGENCY DEBUG: Starting minimal React test");

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("❌ ROOT ELEMENT NOT FOUND!");
  document.body.innerHTML =
    '<div style="background: red; color: white; padding: 20px; font-size: 24px;">CRITICAL ERROR: Root element not found in DOM</div>';
} else {
  console.log("✅ Root element found");

  try {
    console.log("🎨 Creating React root...");
    const root = createRoot(rootElement);

    console.log("🚀 Rendering test component...");
    root.render(
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#1a202c",
          color: "white",
          padding: "40px",
          fontFamily: "Arial, sans-serif",
          fontSize: "18px",
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "48px",
              marginBottom: "20px",
              color: "#48bb78",
            }}
          >
            🚀 REACT IS WORKING!
          </h1>
          <p style={{ fontSize: "24px", marginBottom: "20px" }}>
            If you can see this green text, React is loading successfully.
          </p>
          <p style={{ fontSize: "18px", marginBottom: "30px" }}>
            The blank screen issue was caused by our complex app initialization.
          </p>
          <div
            style={{
              backgroundColor: "#2d3748",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "30px",
            }}
          >
            <h2 style={{ color: "#fbd38d", marginBottom: "15px" }}>
              Debug Info:
            </h2>
            <p>✅ React: Working</p>
            <p>✅ DOM: Root element found</p>
            <p>✅ TypeScript: Compiling</p>
            <p>✅ Vite: Dev server running</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: "#48bb78",
              color: "white",
              border: "none",
              padding: "15px 30px",
              fontSize: "18px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            🔄 Refresh Page
          </button>
        </div>
      </div>,
    );

    console.log("✅ EMERGENCY RENDER SUCCESSFUL!");
  } catch (error) {
    console.error("❌ EMERGENCY RENDER FAILED:", error);
    rootElement.innerHTML = `
      <div style="background: red; color: white; padding: 40px; font-size: 20px; text-align: center;">
        <h1>REACT RENDER ERROR</h1>
        <p>Error: ${error.message}</p>
        <p>Check console for details</p>
      </div>
    `;
  }
}
