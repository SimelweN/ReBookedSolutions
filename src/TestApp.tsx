import React from "react";

function TestApp() {
  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "system-ui",
        background: "#f0f0f0",
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
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#333", marginBottom: "1rem" }}>
          ✅ React is Working!
        </h1>
        <p style={{ color: "#666", marginBottom: "1rem" }}>
          ReBooked Solutions - Test App
        </p>
        <button
          onClick={() => alert("React events are working!")}
          style={{
            background: "#3b82f6",
            color: "white",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Test Click
        </button>
        <p style={{ fontSize: "0.875rem", color: "#999", marginTop: "1rem" }}>
          Environment: {import.meta.env.MODE}
        </p>
      </div>
    </div>
  );
}

export default TestApp;
