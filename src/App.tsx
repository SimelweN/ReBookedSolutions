import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { ThemeProvider } from "next-themes";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import AuthErrorHandler from "./components/AuthErrorHandler";
import GoogleMapsProvider from "./contexts/GoogleMapsContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import LoadingSpinner from "./components/LoadingSpinner";
import PerformanceMetrics from "./components/PerformanceMetrics";
import { debugConnection } from "./utils/debugConnection";
import { validateApiKey } from "./utils/validateApiKey";
import { PaymentTester } from "./utils/paymentTester";
import { testPaymentSetup } from "./utils/testPaymentSetup";
import { DatabaseSetup } from "./utils/databaseSetup";
import { debugBankingDetails } from "./utils/debugBankingDetails";
import {
  checkDatabaseStatus,
  logDatabaseStatus,
} from "./utils/databaseConnectivityHelper";
import { preloadCriticalRoutes } from "./utils/routePreloader";
import EmergencyBypass from "./components/EmergencyBypass";
import "./App.css";

// Initialize debug utilities in development
if (import.meta.env.DEV) {
  (window as any).debugConnection = debugConnection;
  (window as any).validateApiKey = validateApiKey;
  (window as any).PaymentTester = PaymentTester;
  (window as any).testPaymentSetup = testPaymentSetup;
  (window as any).DatabaseSetup = DatabaseSetup;
  (window as any).debugBankingDetails = debugBankingDetails;
  (window as any).checkDatabaseStatus = checkDatabaseStatus;
  (window as any).logDatabaseStatus = logDatabaseStatus;
  console.log("🛠️ Debug utilities available:");
  console.log("  - debugConnection() - Full connection test");
  console.log("  - validateApiKey() - Check API key validity");
  console.log("  - PaymentTester.testPaymentSystem() - Test payment setup");
  console.log(
    "  - testPaymentSetup() - Test user requirements for listing books",
  );
  console.log(
    "  - DatabaseSetup.showSetupInstructions() - Check database setup",
  );
  console.log("  - debugBankingDetails() - Debug banking details errors");
  console.log("  - checkDatabaseStatus() - Check database connectivity");
  console.log("  - logDatabaseStatus() - Log current database status");
}

// Import Index directly for instant loading
import IndexPage from "./pages/Index";
const Index = () => <IndexPage />;
const BookListing = React.lazy(() => import("./pages/BookListing"));
const BookDetails = React.lazy(() => import("./pages/BookDetails"));
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const Profile = React.lazy(() => import("./pages/Profile"));
const CreateListing = React.lazy(() => import("./pages/CreateListing"));
const GoogleMapsDemo = React.lazy(() => import("./pages/GoogleMapsDemo"));
const MapsTest = React.lazy(() => import("./pages/MapsTest"));
const BasicMapsExample = React.lazy(() => import("./pages/BasicMapsExample"));
const WorkingMapsDemo = React.lazy(() => import("./pages/WorkingMapsDemo"));
const Admin = React.lazy(() => import("./pages/Admin"));
const AdminReports = React.lazy(() => import("./pages/AdminReports"));
const UniversityInfo = React.lazy(() => import("./pages/UniversityInfo"));
const ModernUniversityProfile = React.lazy(
  () => import("./pages/ModernUniversityProfile"),
);
const UniversityProfile = React.lazy(() => import("./pages/UniversityProfile"));
const Policies = React.lazy(() => import("./pages/Policies"));
const Privacy = React.lazy(() => import("./pages/Privacy"));
const Terms = React.lazy(() => import("./pages/Terms"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Cart = React.lazy(() => import("./pages/Cart"));
const Checkout = React.lazy(() => import("./pages/Checkout"));
const Notifications = React.lazy(() => import("./pages/Notifications"));
const Shipping = React.lazy(() => import("./pages/Shipping"));
const ActivityLog = React.lazy(() => import("./pages/ActivityLog"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const Verify = React.lazy(() => import("./pages/Verify"));
const ContactUs = React.lazy(() => import("./pages/ContactUs"));
const EditBook = React.lazy(() => import("./pages/EditBook"));
const StudyResources = React.lazy(() => import("./pages/StudyResources"));
const Confirm = React.lazy(() => import("./pages/Confirm"));
const ConfirmEmailChange = React.lazy(
  () => import("./pages/ConfirmEmailChange"),
);
const Report = React.lazy(() => import("./pages/Report"));
const UserProfile = React.lazy(() => import("./pages/UserProfile"));
const FAQ = React.lazy(() => import("./pages/FAQ"));
const APSDemo = React.lazy(() => import("./pages/APSDemo"));
const PaymentCallback = React.lazy(() => import("./pages/PaymentCallback"));
const PaymentDashboard = React.lazy(() => import("./pages/PaymentDashboard"));
const SystemStatus = React.lazy(() => import("./pages/SystemStatus"));

// Create query client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});

// Optimized loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <LoadingSpinner size="lg" />
  </div>
);

// Fallback component for dynamic import failures
const ImportFailureFallback: React.FC<{ error?: Error }> = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md mx-auto text-center p-6">
      <div className="mb-4">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Error</h3>
      <p className="text-gray-600 mb-4">
        There was a problem loading the page. This might be due to a network
        issue.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
      >
        Refresh Page
      </button>
    </div>
  </div>
);

// Minimal loading component
const MinimalLoader = () => (
  <div className="flex items-center justify-center h-24">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
  </div>
);

// Instant route wrapper - no loading at all
const InstantRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <React.Fragment>{children}</React.Fragment>;

function App() {
  // Preload critical routes for faster navigation
  React.useEffect(() => {
    preloadCriticalRoutes();
  }, []);

  return (
    <EmergencyBypass>
      <ErrorBoundary level="app">
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" defaultTheme="light">
            <GoogleMapsProvider>
              <AuthProvider>
                <CartProvider>
                  <Router>
                    <AuthErrorHandler />
                    <ScrollToTop />
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route
                        path="/books"
                        element={
                          <InstantRoute>
                            <BookListing />
                          </InstantRoute>
                        }
                      />
                      <Route
                        path="/books/:id"
                        element={
                          <InstantRoute>
                            <BookDetails />
                          </InstantRoute>
                        }
                      />
                      <Route
                        path="/book/:id"
                        element={
                          <InstantRoute>
                            <BookDetails />
                          </InstantRoute>
                        }
                      />
                      <Route
                        path="/login"
                        element={
                          <InstantRoute>
                            <Login />
                          </InstantRoute>
                        }
                      />
                      <Route
                        path="/register"
                        element={
                          <InstantRoute>
                            <Register />
                          </InstantRoute>
                        }
                      />
                      <Route
                        path="/forgot-password"
                        element={
                          <InstantRoute>
                            <ForgotPassword />
                          </InstantRoute>
                        }
                      />
                      <Route
                        path="/reset-password"
                        element={
                          <InstantRoute>
                            <ResetPassword />
                          </InstantRoute>
                        }
                      />
                      <Route
                        path="/verify"
                        element={
                          <InstantRoute>
                            <Verify />
                          </InstantRoute>
                        }
                      />
                      <Route
                        path="/confirm"
                        element={
                          <InstantRoute>
                            <Confirm />
                          </InstantRoute>
                        }
                      />
                      <Route
                        path="/confirm-email-change"
                        element={
                          <InstantRoute>
                            <ConfirmEmailChange />
                          </InstantRoute>
                        }
                      />

                      {/* University and Campus Routes */}
                      <Route
                        path="/university-info"
                        element={
                          <InstantRoute>
                            <UniversityInfo />
                          </InstantRoute>
                        }
                      />
                      <Route
                        path="/university-profile"
                        element={
                          <InstantRoute>
                            <ModernUniversityProfile />
                          </InstantRoute>
                        }
                      />
                      <Route
                        path="/university/:id"
                        element={
                          <InstantRoute>
                            <UniversityProfile />
                          </InstantRoute>
                        }
                      />
                      <Route
                        path="/study-resources"
                        element={
                          <InstantRoute>
                            <StudyResources />
                          </InstantRoute>
                        }
                      />
                      <Route
                        path="/study-tips"
                        element={
                          <InstantRoute>
                            <StudyResources />
                          </InstantRoute>
                        }
                      />
                      <Route
                        path="/aps-demo"
                        element={
                          <InstantRoute>
                            <APSDemo />
                          </InstantRoute>
                        }
                      />
                      <Route
                        path="/system-status"
                        element={
                          <InstantRoute>
                            <SystemStatus />
                          </InstantRoute>
                        }
                      />

                      {/* Shopping and Cart Routes */}
                      <Route
                        path="/cart"
                        element={
                          <InstantRoute>
                            <Cart />
                          </InstantRoute>
                        }
                      />
                      <Route
                        path="/checkout/:id"
                        element={
                          <InstantRoute>
                            <Checkout />
                          </InstantRoute>
                        }
                      />
                      <Route
                        path="/checkout/cart"
                        element={
                          <InstantRoute>
                            <Checkout />
                          </InstantRoute>
                        }
                      />
                      <Route
                        path="/shipping"
                        element={
                          <InstantRoute>
                            <Shipping />
                          </InstantRoute>
                        }
                      />
                      <Route
                        path="/payment-callback"
                        element={
                          <InstantRoute>
                            <PaymentCallback />
                          </InstantRoute>
                        }
                      />
                      <Route
                        path="/payments"
                        element={
                          <InstantRoute>
                            <ProtectedRoute>
                              <PaymentDashboard />
                            </ProtectedRoute>
                          </InstantRoute>
                        }
                      />

                      {/* Support and Info Pages */}
                      <Route
                        path="/contact"
                        element={
                          <InstantRoute>
                            <ContactUs />
                          </InstantRoute>
                        }
                      />
                      <Route
                        path="/faq"
                        element={
                          <InstantRoute>
                            <FAQ />
                          </InstantRoute>
                        }
                      />
                      <Route
                        path="/policies"
                        element={
                          <InstantRoute>
                            <Policies />
                          </InstantRoute>
                        }
                      />
                      <Route
                        path="/privacy"
                        element={
                          <InstantRoute>
                            <Privacy />
                          </InstantRoute>
                        }
                      />
                      <Route
                        path="/terms"
                        element={
                          <InstantRoute>
                            <Terms />
                          </InstantRoute>
                        }
                      />
                      <Route
                        path="/google-maps-demo"
                        element={
                          <InstantRoute>
                            <GoogleMapsDemo />
                          </InstantRoute>
                        }
                      />
                      <Route
                        path="/maps-test"
                        element={
                          <InstantRoute>
                            <MapsTest />
                          </InstantRoute>
                        }
                      />
                      <Route
                        path="/basic-maps"
                        element={
                          <InstantRoute>
                            <BasicMapsExample />
                          </InstantRoute>
                        }
                      />
                      <Route
                        path="/working-maps"
                        element={
                          <InstantRoute>
                            <WorkingMapsDemo />
                          </InstantRoute>
                        }
                      />

                      {/* Protected Routes */}
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <InstantRoute>
                              <Profile />
                            </InstantRoute>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/user-profile"
                        element={
                          <ProtectedRoute>
                            <InstantRoute>
                              <UserProfile />
                            </InstantRoute>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/create-listing"
                        element={
                          <ProtectedRoute>
                            <InstantRoute>
                              <CreateListing />
                            </InstantRoute>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/edit-book/:id"
                        element={
                          <ProtectedRoute>
                            <InstantRoute>
                              <EditBook />
                            </InstantRoute>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/notifications"
                        element={
                          <ProtectedRoute>
                            <InstantRoute>
                              <Notifications />
                            </InstantRoute>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/activity"
                        element={
                          <ProtectedRoute>
                            <InstantRoute>
                              <ActivityLog />
                            </InstantRoute>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/report"
                        element={
                          <ProtectedRoute>
                            <InstantRoute>
                              <Report />
                            </InstantRoute>
                          </ProtectedRoute>
                        }
                      />

                      {/* Admin Routes */}
                      <Route
                        path="/admin"
                        element={
                          <AdminProtectedRoute>
                            <InstantRoute>
                              <Admin />
                            </InstantRoute>
                          </AdminProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/reports"
                        element={
                          <AdminProtectedRoute>
                            <InstantRoute>
                              <AdminReports />
                            </InstantRoute>
                          </AdminProtectedRoute>
                        }
                      />

                      <Route
                        path="*"
                        element={
                          <InstantRoute>
                            <NotFound />
                          </InstantRoute>
                        }
                      />
                    </Routes>
                  </Router>
                </CartProvider>
              </AuthProvider>
            </GoogleMapsProvider>
            {/* Performance monitoring */}
            <PerformanceMetrics />

            {/* Vercel Analytics and Speed Insights */}
            <Analytics />
            <SpeedInsights />
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </EmergencyBypass>
  );
}

// Add debugging utilities to window in development
if (import.meta.env.DEV) {
  console.log("🎉 Payment system frontend is ready!");
  console.log("💳 Complete payment integration implemented");
  console.log("🧪 Test utilities: window.PaymentTester.testPaymentSystem()");
  console.log(
    "🔄 Payment flow: PaymentButton → Paystack → PaymentCallback → TransactionStatus",
  );
}

export default App;
