import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

// Test importing AuthContext specifically
import { AuthProvider } from "./contexts/AuthContext";

function TestApp() {
  return (
    <AuthProvider>
      <h1>Hello with AuthContext</h1>
    </AuthProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>,
);
