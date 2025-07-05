import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";

// Simple components to test functionality
const HomePage = () => (
  <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
    <h1 style={{ color: "#2563eb" }}>🏠 ReBooked Solutions</h1>
    <p>Welcome to your textbook marketplace!</p>
    <nav style={{ marginTop: "20px" }}>
      <a
        href="/books"
        style={{
          marginRight: "20px",
          color: "#2563eb",
          textDecoration: "underline",
        }}
      >
        Browse Books
      </a>
      <a
        href="/login"
        style={{
          marginRight: "20px",
          color: "#2563eb",
          textDecoration: "underline",
        }}
      >
        Login
      </a>
      <a
        href="/register"
        style={{ color: "#2563eb", textDecoration: "underline" }}
      >
        Register
      </a>
    </nav>
    <div
      style={{
        marginTop: "40px",
        padding: "20px",
        background: "#f0f9ff",
        borderRadius: "8px",
      }}
    >
      <h2>✅ App Status:</h2>
      <ul>
        <li>✅ React rendering</li>
        <li>✅ React Router working</li>
        <li>✅ Theme provider working</li>
        <li>⏳ Adding more functionality...</li>
      </ul>
    </div>
  </div>
);

const BooksPage = () => (
  <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
    <h1 style={{ color: "#2563eb" }}>📚 Books</h1>
    <p>Browse textbooks here</p>
    <a href="/" style={{ color: "#2563eb" }}>
      ← Back to Home
    </a>
  </div>
);

const LoginPage = () => (
  <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
    <h1 style={{ color: "#2563eb" }}>🔐 Login</h1>
    <p>Login form will be here</p>
    <a href="/" style={{ color: "#2563eb" }}>
      ← Back to Home
    </a>
  </div>
);

const RegisterPage = () => (
  <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
    <h1 style={{ color: "#2563eb" }}>📝 Register</h1>
    <p>Registration form will be here</p>
    <a href="/" style={{ color: "#2563eb" }}>
      ← Back to Home
    </a>
  </div>
);

const SimpleApp = () => {
  console.log("SimpleApp rendering...");

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <Router>
        <div style={{ minHeight: "100vh", background: "white" }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="*"
              element={
                <div style={{ padding: "20px" }}>
                  <h1>404 - Page Not Found</h1>
                  <a href="/" style={{ color: "#2563eb" }}>
                    ← Back to Home
                  </a>
                </div>
              }
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default SimpleApp;
