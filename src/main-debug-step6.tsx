import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";

function TestApp() {
  return (
    <Router>
      <h1>Hello with React Router</h1>
    </Router>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>,
);
