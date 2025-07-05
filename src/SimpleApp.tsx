import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import GoogleMapsProvider from "./contexts/GoogleMapsContext";
import ErrorBoundary from "./components/ErrorBoundary";

// Import real pages
import IndexPage from "./pages/Index";

// Use real IndexPage component
const HomePage = () => <IndexPage />;

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

const ActivityPage = () => (
  <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
    <h1 style={{ color: "#2563eb" }}>📊 Activity Log</h1>
    <p>Your activity and transactions will be displayed here</p>
    <div
      style={{
        marginTop: "20px",
        padding: "15px",
        background: "#f0f9ff",
        borderRadius: "8px",
      }}
    >
      <h3>Recent Activity:</h3>
      <ul>
        <li>✅ Account created</li>
        <li>✅ Profile updated</li>
        <li>✅ Browsed books</li>
      </ul>
    </div>
    <a
      href="/"
      style={{ color: "#2563eb", marginTop: "20px", display: "inline-block" }}
    >
      ← Back to Home
    </a>
  </div>
);

const ProfilePage = () => (
  <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
    <h1 style={{ color: "#2563eb" }}>👤 Profile</h1>
    <p>Your profile information</p>
    <a href="/" style={{ color: "#2563eb" }}>
      ← Back to Home
    </a>
  </div>
);

const UniversityInfoPage = () => (
  <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
    <h1 style={{ color: "#2563eb" }}>🎓 University Information</h1>
    <p>APS Calculator, University Programs, and Campus Information</p>
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
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/university-info" element={<UniversityInfoPage />} />
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
