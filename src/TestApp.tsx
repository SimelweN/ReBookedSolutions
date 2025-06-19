import React from "react";

const TestApp = () => {
  console.log("🔍 TestApp rendering");

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f0f0f0",
        minHeight: "100vh",
        fontSize: "18px",
      }}
    >
      <h1 style={{ color: "blue" }}>
        Test App - If you see this, React is working!
      </h1>
      <p>Current time: {new Date().toLocaleString()}</p>
      <p>Environment: {process.env.NODE_ENV}</p>
      <div style={{ marginTop: "20px" }}>
        <button onClick={() => alert("Button works!")}>
          Click me to test JavaScript
        </button>
      </div>
    </div>
  );
};

export default TestApp;
