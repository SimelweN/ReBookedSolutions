import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingFallback from "./components/LoadingFallback";

// Import directly instead of lazy loading for minimal test
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";

const AppMinimal = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </ErrorBoundary>
  );
};

export default AppMinimal;
