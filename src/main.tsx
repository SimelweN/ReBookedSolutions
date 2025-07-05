import React from "react";
import ReactDOM from "react-dom";

console.log("🚀 Starting ReBooked Solutions...");

// Simple test component first
const SimpleApp = () => {
  console.log("SimpleApp component rendering...");
  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        background: "#f0f0f0",
      }}
    >
      <h1 style={{ color: "green" }}>✅ ReBooked Solutions</h1>
      <p>Application is loading...</p>
      <p>Time: {new Date().toLocaleString()}</p>
    </div>
  );
};

const rootElement = document.getElementById("root");
console.log("Root element:", rootElement);

if (!rootElement) {
  throw new Error("Root element not found");
}

// Use React 17 style rendering for compatibility
ReactDOM.render(<SimpleApp />, rootElement);

console.log("✅ Simple app rendered");
