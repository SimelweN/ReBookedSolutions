import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

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
  return (
    <ErrorBoundary level="app">
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthProvider>
          <CartProvider>
            <Router>
              <div style={{ minHeight: "100vh", background: "white" }}>
                <Routes>
                  {/* Home route */}
                  <Route path="/" element={<IndexPage />} />

                  {/* Public routes */}
                  <Route path="/books" element={<BookListing />} />
                  <Route path="/books/:id" element={<BookDetails />} />
                  <Route path="/book/:id" element={<BookDetails />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* University and Campus Routes */}
                  <Route
                    path="/university-info"
                    element={<UniversityInfoPage />}
                  />
                  <Route path="/study-resources" element={<StudyResources />} />

                  {/* Shopping and Cart Routes */}
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/shipping" element={<Shipping />} />

                  {/* Support and Info Pages */}
                  <Route path="/contact" element={<ContactUs />} />
                  <Route path="/faq" element={<FAQ />} />

                  {/* Protected Routes */}
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/user-profile" element={<UserProfile />} />
                  <Route path="/create-listing" element={<CreateListing />} />
                  <Route path="/activity" element={<ActivityLog />} />
                  <Route path="/my-orders" element={<UserOrders />} />
                  <Route path="/banking-setup" element={<BankingSetup />} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/reports" element={<AdminReports />} />

                  {/* 404 Route */}
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
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default SimpleApp;
