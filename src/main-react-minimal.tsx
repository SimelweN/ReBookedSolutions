import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

// Ultra-minimal test component
const MinimalApp = () => {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>ReBooked Solutions</h1>
      <p>Minimal test version for Workers build compatibility</p>
    </div>
  );
};

// Minimal entry point
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MinimalApp />
  </React.StrictMode>,
);
