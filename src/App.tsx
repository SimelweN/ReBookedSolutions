import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import GoogleMapsProvider from "./contexts/GoogleMapsContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import { Toaster } from "@/components/ui/sonner";
import NoScriptFallback from "./components/NoScriptFallback";
import LoadingFallback from "./components/LoadingFallback";
import StartupChecker from "./components/StartupChecker";
import { validateEnvironment } from "./config/environment";
import { useCommitAutoExpiry } from "./hooks/useCommitAutoExpiry";
import "./App.css";

// Import critical pages directly
import IndexPage from "./pages/Index";
import UniversityInfoPage from "./pages/UniversityInfo";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import AdminPage from "./pages/Admin";
// Profile imported directly due to dynamic import fetch issues
import Profile from "./pages/Profile";

// Lazy load other pages
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const BookListing = React.lazy(() => import("./pages/BookListing"));
const BookDetails = React.lazy(() => import("./pages/BookDetails"));

const CreateListing = React.lazy(() => import("./pages/CreateListing"));
const Cart = React.lazy(() => import("./pages/Cart"));
const Checkout = React.lazy(() => import("./pages/Checkout"));
const NewCheckout = React.lazy(() => import("./pages/NewCheckout"));
const SellerMarketplace = React.lazy(() => import("./pages/SellerMarketplace"));
const Shipping = React.lazy(() => import("./pages/Shipping"));
const ContactUs = React.lazy(() => import("./pages/ContactUs"));
const FAQ = React.lazy(() => import("./pages/FAQ"));
const AddProgram = React.lazy(() => import("./pages/AddProgram"));
const StudyResources = React.lazy(() => import("./pages/StudyResources"));

const UserOrders = React.lazy(() => import("./pages/EnhancedUserOrders"));
const BankingSetup = React.lazy(() => import("./pages/BankingSetup"));
const AdminReports = React.lazy(() => import("./pages/AdminReports"));
const EditBook = React.lazy(() => import("./pages/EditBook"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Policies = React.lazy(() => import("./pages/Policies"));
const Privacy = React.lazy(() => import("./pages/Privacy"));
const Terms = React.lazy(() => import("./pages/Terms"));
const CookieSettingsPage = React.lazy(() => import("./pages/CookieSettings"));
const Report = React.lazy(() => import("./pages/Report"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const Verify = React.lazy(() => import("./pages/Verify"));
const Confirm = React.lazy(() => import("./pages/Confirm"));
const ConfirmEmailChange = React.lazy(
  () => import("./pages/ConfirmEmailChange"),
);
const Notifications = React.lazy(() => import("./pages/Notifications"));
const CheckoutSuccess = React.lazy(() => import("./pages/CheckoutSuccess"));
const PaymentStatus = React.lazy(() => import("./pages/PaymentStatus"));
const PaymentCallback = React.lazy(() => import("./pages/PaymentCallback"));
const UniversityProfile = React.lazy(() => import("./pages/UniversityProfile"));
const Receipt = React.lazy(() => import("./pages/Receipt"));
const ActivityLog = React.lazy(() => import("./pages/ActivityLog"));
const DevDashboard = React.lazy(() => import("./pages/DevDashboard"));

// Loading component with fallback
const LoadingSpinner = () => <LoadingFallback type="compact" />;

function App() {
  const [systemReady, setSystemReady] = React.useState(false);
  const [showStartupChecker, setShowStartupChecker] = React.useState(false);

  // Initialize commit auto-expiry system
  useCommitAutoExpiry();

  React.useEffect(() => {
    // Check if system needs setup
    const envValid = validateEnvironment();

    // In development, always show startup checker if env is not valid
    // In production, only show if critical services are missing
    if (!envValid && import.meta.env.DEV) {
      setShowStartupChecker(true);
    } else {
      setSystemReady(true);
    }
  }, []);

  const handleStartupComplete = () => {
    setShowStartupChecker(false);
    setSystemReady(true);
  };

  return (
    <>
      <NoScriptFallback />
      {showStartupChecker && (
        <StartupChecker onComplete={handleStartupComplete} />
      )}
      <ErrorBoundary level="app">
        <ThemeProvider attribute="class" defaultTheme="light">
          <GoogleMapsProvider>
            <AuthProvider>
              <CartProvider>
                <Router
                  future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                  }}
                >
                  <div className="min-h-screen bg-white">
                    <Suspense fallback={<LoadingSpinner />}>
                      <Routes>
                        {/* Home route */}
                        <Route path="/" element={<IndexPage />} />

                        {/* Public routes */}
                        <Route
                          path="/books"
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <BookListing />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/books/:id"
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <BookDetails />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/book/:id"
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <BookDetails />
                            </Suspense>
                          }
                        />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route
                          path="/forgot-password"
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <ForgotPassword />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/reset-password"
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <ResetPassword />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/verify"
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <Verify />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/confirm"
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <Confirm />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/confirm-email-change"
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <ConfirmEmailChange />
                            </Suspense>
                          }
                        />

                        {/* University and Campus Routes */}
                        <Route
                          path="/university-info"
                          element={<UniversityInfoPage />}
                        />

                        {/* University Profile Route */}
                        <Route
                          path="/university/:id"
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <UniversityProfile />
                            </Suspense>
                          }
                        />

                        {/* Study Resources Routes */}
                        <Route
                          path="/study-resources"
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <StudyResources />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/study-tips"
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <StudyResources />
                            </Suspense>
                          }
                        />

                        {/* Shopping and Cart Routes */}
                        <Route
                          path="/cart"
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <Cart />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/shipping"
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <Shipping />
                            </Suspense>
                          }
                        />

                        {/* Support and Info Pages */}
                        <Route
                          path="/contact"
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <ContactUs />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/faq"
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <FAQ />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/policies"
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <Policies />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/privacy"
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <Privacy />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/terms"
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <Terms />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/cookie-settings"
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <CookieSettingsPage />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/report"
                          element={
                            <ProtectedRoute>
                              <Suspense fallback={<LoadingSpinner />}>
                                <Report />
                              </Suspense>
                            </ProtectedRoute>
                          }
                        />

                        {/* Protected Routes */}
                        <Route
                          path="/dashboard"
                          element={
                            <ProtectedRoute>
                              <Suspense fallback={<LoadingSpinner />}>
                                <Dashboard />
                              </Suspense>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/profile"
                          element={
                            <ProtectedRoute>
                              <Profile />
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/create-listing"
                          element={
                            <ProtectedRoute>
                              <Suspense fallback={<LoadingSpinner />}>
                                <CreateListing />
                              </Suspense>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/edit-book/:id"
                          element={
                            <ProtectedRoute>
                              <Suspense fallback={<LoadingSpinner />}>
                                <EditBook />
                              </Suspense>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/checkout"
                          element={
                            <ProtectedRoute>
                              <Suspense fallback={<LoadingSpinner />}>
                                <Checkout />
                              </Suspense>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/purchase"
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <NewCheckout />
                            </Suspense>
                          }
                        />

                        <Route
                          path="/seller/:sellerId"
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <SellerMarketplace />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/marketplace/:sellerId"
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <SellerMarketplace />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/checkout/success"
                          element={
                            <ProtectedRoute>
                              <Suspense fallback={<LoadingSpinner />}>
                                <CheckoutSuccess />
                              </Suspense>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/payment-status/:orderId?"
                          element={
                            <ProtectedRoute>
                              <Suspense fallback={<LoadingSpinner />}>
                                <PaymentStatus />
                              </Suspense>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/payment-callback"
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <PaymentCallback />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/notifications"
                          element={
                            <ProtectedRoute>
                              <Suspense fallback={<LoadingSpinner />}>
                                <Notifications />
                              </Suspense>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/receipt/:reference"
                          element={
                            <ProtectedRoute>
                              <Suspense fallback={<LoadingSpinner />}>
                                <Receipt />
                              </Suspense>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/activity"
                          element={
                            <ProtectedRoute>
                              <Suspense fallback={<LoadingSpinner />}>
                                <ActivityLog />
                              </Suspense>
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/my-orders"
                          element={
                            <ProtectedRoute>
                              <Suspense fallback={<LoadingSpinner />}>
                                <UserOrders />
                              </Suspense>
                            </ProtectedRoute>
                          }
                        />
                        {/* Redirect /orders to /my-orders */}
                        <Route
                          path="/orders"
                          element={
                            <ProtectedRoute>
                              <Suspense fallback={<LoadingSpinner />}>
                                <UserOrders />
                              </Suspense>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/banking-setup"
                          element={
                            <ProtectedRoute>
                              <Suspense fallback={<LoadingSpinner />}>
                                <BankingSetup />
                              </Suspense>
                            </ProtectedRoute>
                          }
                        />

                        {/* Program Submission Route */}
                        <Route
                          path="/add-program"
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <AddProgram />
                            </Suspense>
                          }
                        />

                        {/* Admin Routes */}
                        <Route
                          path="/admin"
                          element={
                            <AdminProtectedRoute>
                              <AdminPage />
                            </AdminProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/reports"
                          element={
                            <AdminProtectedRoute>
                              <Suspense fallback={<LoadingSpinner />}>
                                <AdminReports />
                              </Suspense>
                            </AdminProtectedRoute>
                          }
                        />

                        {/* Development Dashboard - Admin only */}
                        <Route
                          path="/dev-dashboard"
                          element={
                            <AdminProtectedRoute>
                              <Suspense fallback={<LoadingSpinner />}>
                                <DevDashboard />
                              </Suspense>
                            </AdminProtectedRoute>
                          }
                        />

                        {/* 404 Route */}
                        <Route
                          path="*"
                          element={
                            <Suspense fallback={<LoadingSpinner />}>
                              <NotFound />
                            </Suspense>
                          }
                        />
                      </Routes>
                    </Suspense>
                  </div>
                </Router>
                <Toaster position="top-center" />
              </CartProvider>
            </AuthProvider>
          </GoogleMapsProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </>
  );
}

export default App;
