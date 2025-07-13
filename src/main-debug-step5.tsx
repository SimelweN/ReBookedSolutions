import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

// Test a simple context directly
const TestContext = React.createContext<string>("default");

function TestApp() {
  return (
    <TestContext.Provider value="Hello from context">
      <TestContext.Consumer>{(value) => <h1>{value}</h1>}</TestContext.Consumer>
    </TestContext.Provider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>,
);
