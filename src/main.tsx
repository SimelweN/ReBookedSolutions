import React from "react";
import { createRoot } from "react-dom/client";

// Simple, reliable initialization
console.log("🚀 ReBooked Solutions - Starting...");

// Simple test component to check if React renders
const TestApp = () => {
  console.log("TestApp rendering...");
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ color: "green" }}>✅ React is Working!</h1>
      <p>This is a test to verify React rendering works.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
};

// Get root element
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

console.log("Root element found:", rootElement);

// Create React root
const root = createRoot(rootElement);
console.log("React root created");

// Simple render
root.render(<TestApp />);

console.log("✅ TestApp rendered successfully");
