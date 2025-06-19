import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import "./App.css";

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Test basic page component
const TestHomePage = () => (
  <div style={{
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'system-ui'
  }}>
    <div style={{
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      maxWidth: '500px'
    }}>
      <h1 style={{ color: '#10b981', marginBottom: '1rem', fontSize: '1.875rem', fontWeight: 'bold' }}>
        🎉 ReBooked Solutions
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem', lineHeight: '1.6' }}>
        Step 2 Complete: Error boundaries and providers working!
      </p>
      <div style={{
        backgroundColor: '#f0fdf4',
        border: '1px solid #22c55e',
        borderRadius: '0.375rem',
        padding: '1rem',
        marginBottom: '1.5rem'
      }}>
        <p style={{ color: '#15803d', fontSize: '0.875rem', margin: 0 }}>
          ✅ React Router working<br/>
          ✅ ErrorBoundary loaded<br/>
          ✅ AuthProvider loaded<br/>
          ✅ CartProvider loaded<br/>
          ✅ QueryClient loaded
        </p>
      </div>
      <button
        onClick={() => console.log('Router test successful')}
        style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '0.75rem 1.5rem',
          border: 'none',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          cursor: 'pointer'
        }}
      >
        🔄 Test Router
      </button>
    </div>
  </div>
);

function App() {
  try {
    return (
      <ErrorBoundary level="app">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <CartProvider>
              <Router>
                <div className="min-h-screen bg-gray-50">
                  <Routes>
                    <Route path="/" element={<TestHomePage />} />
                    <Route path="*" element={<TestHomePage />} />
                  </Routes>
                </div>
              </Router>
            </CartProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    );
  }
  } catch (error) {
    console.error("Error in App:", error);
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fef2f2',
        fontFamily: 'system-ui'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          border: '1px solid #fca5a5',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#dc2626', marginBottom: '1rem' }}>
            Step 1 Failed
          </h1>
          <p style={{ color: '#6b7280' }}>
            Error in Router/CSS setup: {error instanceof Error ? error.message : String(error)}
          </p>
        </div>
      </div>
    );
  }
}

export default App;