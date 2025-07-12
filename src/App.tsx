import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import ErrorBoundaryEnhanced from "./components/ErrorBoundaryEnhanced";
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

// Only import CSS in browser environment
if (typeof window !== "undefined") {
  import("./App.css");
}

// Import critical pages directly
import IndexPage from "./pages/Index";
import UniversityInfoPage from "./pages/UniversityInfo";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import AdminPage from "./pages/Admin";
// Profile imported directly due to dynamic import fetch issues
import Profile from "./pages/Profile";

// Workers-safe lazy loading - only create lazy components in browser environment
const isBrowserEnv =
  typeof window !== "undefined" && typeof document !== "undefined";

// Create a fallback component for Workers environment
const WorkersFallback = () =>
  React.createElement("div", {
    children: "Page not available in Workers environment",
  });

// Conditionally lazy load pages or use fallback
const Dashboard = isBrowserEnv
  ? React.lazy(() => import("./pages/Dashboard"))
  : WorkersFallback;
const BookListing = isBrowserEnv
  ? React.lazy(() => import("./pages/BookListing"))
  : WorkersFallback;
const BookDetails = isBrowserEnv
  ? React.lazy(() => import("./pages/BookDetails"))
  : WorkersFallback;

const CreateListing = isBrowserEnv
  ? React.lazy(() => import("./pages/CreateListing"))
  : WorkersFallback;
const Cart = isBrowserEnv
  ? React.lazy(() => import("./pages/Cart"))
  : WorkersFallback;
const Checkout = isBrowserEnv
  ? React.lazy(() => import("./pages/Checkout"))
  : WorkersFallback;
const NewCheckout = isBrowserEnv
  ? React.lazy(() => import("./pages/NewCheckout"))
  : WorkersFallback;
const SellerMarketplace = isBrowserEnv
  ? React.lazy(() => import("./pages/SellerMarketplace"))
  : WorkersFallback;
const Shipping = isBrowserEnv
  ? React.lazy(() => import("./pages/Shipping"))
  : WorkersFallback;
const ContactUs = isBrowserEnv
  ? React.lazy(() => import("./pages/ContactUs"))
  : WorkersFallback;
const FAQ = isBrowserEnv
  ? React.lazy(() => import("./pages/FAQ"))
  : WorkersFallback;
const AddProgram = isBrowserEnv
  ? React.lazy(() => import("./pages/AddProgram"))
  : WorkersFallback;
const StudyResources = isBrowserEnv
  ? React.lazy(() => import("./pages/StudyResources"))
  : WorkersFallback;

const UserOrders = isBrowserEnv
  ? React.lazy(() => import("./pages/EnhancedUserOrders"))
  : WorkersFallback;
const BankingSetup = isBrowserEnv
  ? React.lazy(() => import("./pages/BankingSetup"))
  : WorkersFallback;
const AdminReports = isBrowserEnv
  ? React.lazy(() => import("./pages/AdminReports"))
  : WorkersFallback;
const EditBook = isBrowserEnv
  ? React.lazy(() => import("./pages/EditBook"))
  : WorkersFallback;
const NotFound = isBrowserEnv
  ? React.lazy(() => import("./pages/NotFound"))
  : WorkersFallback;
const Policies = isBrowserEnv
  ? React.lazy(() => import("./pages/Policies"))
  : WorkersFallback;
const Privacy = isBrowserEnv
  ? React.lazy(() => import("./pages/Privacy"))
  : WorkersFallback;
const Terms = isBrowserEnv
  ? React.lazy(() => import("./pages/Terms"))
  : WorkersFallback;
const CookieSettingsPage = isBrowserEnv
  ? React.lazy(() => import("./pages/CookieSettings"))
  : WorkersFallback;
const Report = isBrowserEnv
  ? React.lazy(() => import("./pages/Report"))
  : WorkersFallback;
const ForgotPassword = isBrowserEnv
  ? React.lazy(() => import("./pages/ForgotPassword"))
  : WorkersFallback;
const ResetPassword = isBrowserEnv
  ? React.lazy(() => import("./pages/ResetPassword"))
  : WorkersFallback;
const Verify = isBrowserEnv
  ? React.lazy(() => import("./pages/Verify"))
  : WorkersFallback;
const Confirm = isBrowserEnv
  ? React.lazy(() => import("./pages/Confirm"))
  : WorkersFallback;
const ConfirmEmailChange = isBrowserEnv
  ? React.lazy(() => import("./pages/ConfirmEmailChange"))
  : WorkersFallback;
const Notifications = isBrowserEnv
  ? React.lazy(() => import("./pages/Notifications"))
  : WorkersFallback;
const CheckoutSuccess = isBrowserEnv
  ? React.lazy(() => import("./pages/CheckoutSuccess"))
  : WorkersFallback;
const PaymentStatus = isBrowserEnv
  ? React.lazy(() => import("./pages/PaymentStatus"))
  : WorkersFallback;
const PaymentCallback = isBrowserEnv
  ? React.lazy(() => import("./pages/PaymentCallback"))
  : WorkersFallback;
const UniversityProfile = isBrowserEnv
  ? React.lazy(() => import("./pages/UniversityProfile"))
  : WorkersFallback;
const Receipt = isBrowserEnv
  ? React.lazy(() => import("./pages/Receipt"))
  : WorkersFallback;
const ActivityLog = isBrowserEnv
  ? React.lazy(() => import("./pages/ActivityLog"))
  : WorkersFallback;
const DevDashboard = isBrowserEnv
  ? React.lazy(() => import("./pages/DevDashboard"))
  : WorkersFallback;

// Loading component with fallback
const LoadingSpinner = () => <LoadingFallback type="compact" />;

function App() {
  const [systemReady, setSystemReady] = React.useState(false);
  const [showStartupChecker, setShowStartupChecker] = React.useState(false);

  // Workers environment detection
  const isWorkerEnv = React.useMemo(() => {
    try {
      return (
        typeof WorkerGlobalScope !== "undefined" &&
        typeof window === "undefined"
      );
    } catch {
      return false;
    }
  }, []);

  // Initialize commit auto-expiry system only in browser environment
  const commitAutoExpiry = isWorkerEnv ? null : useCommitAutoExpiry();

  React.useEffect(() => {
    // Check if system needs setup
    const envValid = validateEnvironment();

    // Workers-compatible environment check
    const isProd = (() => {
      try {
        if (typeof import.meta !== "undefined" && import.meta.env) {
          return (
            import.meta.env.PROD || import.meta.env.NODE_ENV === "production"
          );
        }
        if (typeof globalThis !== "undefined" && globalThis.process?.env) {
          return globalThis.process.env.NODE_ENV === "production";
        }
        return false;
      } catch {
        return false;
      }
    })();

    const isDev = !isProd;

    // In development, we allow the app to continue with mock services
    // Only show startup checker in production or if explicitly needed
    if (!envValid && isProd) {
      setShowStartupChecker(true);
    } else {
      // In development, always proceed - we have fallback mock services
      setSystemReady(true);
      if (!envValid && isDev) {
        console.log(
          "🔧 Development mode: Proceeding with mock/fallback services",
        );
      }
    }
  }, []);

  const handleStartupComplete = () => {
    setShowStartupChecker(false);
    setSystemReady(true);
  };

  // Early return for Workers environment with static content
  if (isWorkerEnv) {
    return React.createElement("div", {
      style: { padding: "20px", fontFamily: "Arial, sans-serif" },
      children: [
        React.createElement("h1", { key: "title" }, "ReBooked Solutions"),
        React.createElement(
          "p",
          { key: "subtitle" },
          "Static Export for Workers Environment",
        ),
        React.createElement(
          "p",
          { key: "description" },
          "This is a server-side rendered version.",
        ),
      ],
    });
  }

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
