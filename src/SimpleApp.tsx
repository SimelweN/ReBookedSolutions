import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import GoogleMapsProvider from "./contexts/GoogleMapsContext";
import ErrorBoundary from "./components/ErrorBoundary";

// Import all real pages
import IndexPage from "./pages/Index";
import UniversityInfoPage from "./pages/UniversityInfo";
import BookListing from "./pages/BookListing";
import BookDetails from "./pages/BookDetails";
import Profile from "./pages/Profile";
import CreateListing from "./pages/CreateListing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Shipping from "./pages/Shipping";
import ContactUs from "./pages/ContactUs";
import FAQ from "./pages/FAQ";
import StudyResources from "./pages/StudyResources";
import ActivityLog from "./pages/ActivityLog";
import UserProfile from "./pages/UserProfile";
import UserOrders from "./pages/EnhancedUserOrders";
import BankingSetup from "./pages/BankingSetup";
import Admin from "./pages/Admin";
import AdminReports from "./pages/AdminReports";

// All real page components are imported and ready to use

const SimpleApp = () => {
  console.log("SimpleApp rendering...");

  return (
    <ErrorBoundary level="app">
      <ThemeProvider attribute="class" defaultTheme="light">
        <GoogleMapsProvider>
          <AuthProvider>
            <CartProvider>
              <Router>
                <div style={{ minHeight: "100vh", background: "white" }}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/books" element={<BooksPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/activity" element={<ActivityPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route
                      path="/university-info"
                      element={<UniversityInfoPage />}
                    />
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
            </CartProvider>
          </AuthProvider>
        </GoogleMapsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default SimpleApp;
