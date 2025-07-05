import React from "react";
import { createRoot } from "react-dom/client";

console.log("🚀 Starting ReBooked Solutions...");

// Simple test component first
const SimpleApp = () => (
  <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
    <h1 style={{ color: "green" }}>✅ ReBooked Solutions</h1>
    <p>Application is loading...</p>
    <p>Time: {new Date().toLocaleString()}</p>
  </div>
);

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);
root.render(<SimpleApp />);

console.log("✅ Simple app rendered");
