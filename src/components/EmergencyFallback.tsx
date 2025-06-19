import React from "react";

const EmergencyFallback: React.FC = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f3f4f6",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "2rem",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "0.5rem",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          maxWidth: "500px",
        }}
      >
        <h1
          style={{
            color: "#ef4444",
            marginBottom: "1rem",
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
        >
          ReBooked Solutions - Emergency Mode
        </h1>
        <p
          style={{
            color: "#6b7280",
            marginBottom: "1.5rem",
            lineHeight: "1.6",
          }}
        >
          The application is experiencing technical difficulties. We're working
          to resolve this issue.
        </p>
        <div
          style={{
            backgroundColor: "#fef3c7",
            border: "1px solid #f59e0b",
            borderRadius: "0.375rem",
            padding: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <p
            style={{
              color: "#92400e",
              fontSize: "0.875rem",
              margin: 0,
            }}
          >
            <strong>Status:</strong> React is working, investigating component
            issues...
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: "#3b82f6",
            color: "white",
            padding: "0.75rem 1.5rem",
            border: "none",
            borderRadius: "0.375rem",
            fontSize: "0.875rem",
            fontWeight: "500",
            cursor: "pointer",
            marginRight: "0.5rem",
          }}
        >
          🔄 Refresh Page
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          style={{
            backgroundColor: "#6b7280",
            color: "white",
            padding: "0.75rem 1.5rem",
            border: "none",
            borderRadius: "0.375rem",
            fontSize: "0.875rem",
            fontWeight: "500",
            cursor: "pointer",
          }}
        >
          🏠 Home
        </button>
      </div>
    </div>
  );
};

export default EmergencyFallback;
