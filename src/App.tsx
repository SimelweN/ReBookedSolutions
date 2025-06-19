import React from "react";

function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f3f4f6",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "0.5rem",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          maxWidth: "400px",
        }}
      >
        <h1
          style={{
            color: "#059669",
            marginBottom: "1rem",
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
        >
          ✅ ReBooked Solutions
        </h1>
        <p
          style={{
            color: "#6b7280",
            marginBottom: "1.5rem",
            lineHeight: "1.5",
          }}
        >
          React is working! The app is loading successfully. This is a minimal
          version to confirm functionality.
        </p>
        <div
          style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}
        >
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: "#3b82f6",
              color: "white",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "0.25rem",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            🔄 Refresh
          </button>
          <button
            onClick={() => console.log("Debug: App is working")}
            style={{
              backgroundColor: "#10b981",
              color: "white",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "0.25rem",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            ✅ Test
          </button>
        </div>
        <div
          style={{
            marginTop: "1rem",
            padding: "0.75rem",
            backgroundColor: "#f0f9ff",
            border: "1px solid #0ea5e9",
            borderRadius: "0.25rem",
            fontSize: "0.75rem",
            color: "#0c4a6e",
          }}
        >
          Status: Minimal app loaded successfully. Ready to restore full
          functionality.
        </div>
      </div>
    </div>
  );
}

export default App;
