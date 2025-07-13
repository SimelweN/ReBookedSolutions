import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

// Create a minimal version of AuthContext to test
const AuthContext = React.createContext<{ user: null }>({ user: null });

function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext.Provider value={{ user: null }}>
      {children}
    </AuthContext.Provider>
  );
}

function TestApp() {
  return (
    <AuthProvider>
      <h1>Hello with minimal AuthContext</h1>
    </AuthProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>,
);
