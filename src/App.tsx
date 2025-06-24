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

// Simple lazy loading without retry logic for faster performance
const Index = React.lazy(() => import("./pages/Index"));
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

// Simple route wrapper - no complex error boundaries
const SimpleRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<MinimalLoader />}>{children}</Suspense>
);

function App() {
  // Preload critical routes for faster navigation
  React.useEffect(() => {
    preloadCriticalRoutes();
  }, []);

  return (
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
                    <Route
                      path="/"
                      element={
                        <SimpleRoute>
                          <Index />
                        </SimpleRoute>
                      }
                    />
                    <Route
                      path="/books"
                      element={
                        <SimpleRoute>
                          <BookListing />
                        </SimpleRoute>
                      }
                    />
                    <Route
                      path="/books/:id"
                      element={
                        <SimpleRoute>
                          <BookDetails />
                        </SimpleRoute>
                      }
                    />
                    <Route
                      path="/book/:id"
                      element={
                        <SimpleRoute>
                          <BookDetails />
                        </SimpleRoute>
                      }
                    />
                    <Route
                      path="/login"
                      element={
                        <SimpleRoute>
                          <Login />
                        </SimpleRoute>
                      }
                    />
                    <Route
                      path="/register"
                      element={
                        <SimpleRoute>
                          <Register />
                        </SimpleRoute>
                      }
                    />
                    <Route
                      path="/forgot-password"
                      element={
                        <SimpleRoute>
                          <ForgotPassword />
                        </SimpleRoute>
                      }
                    />
                    <Route
                      path="/reset-password"
                      element={
                        <SimpleRoute>
                          <ResetPassword />
                        </SimpleRoute>
                      }
                    />
                    <Route
                      path="/verify"
                      element={
                        <SimpleRoute>
                          <Verify />
                        </SimpleRoute>
                      }
                    />
                    <Route
                      path="/confirm"
                      element={
                        <SimpleRoute>
                          <Confirm />
                        </SimpleRoute>
                      }
                    />
                    <Route
                      path="/confirm-email-change"
                      element={
                        <SimpleRoute>
                          <ConfirmEmailChange />
                        </SimpleRoute>
                      }
                    />

                    {/* University and Campus Routes */}
                    <Route
                      path="/university-info"
                      element={
                        <SimpleRoute>
                          <UniversityInfo />
                        </SimpleRoute>
                      }
                    />
                    <Route
                      path="/university-profile"
                      element={
                        <SimpleRoute>
                          <ModernUniversityProfile />
                        </SimpleRoute>
                      }
                    />
                    <Route
                      path="/university/:id"
                      element={
                        <SimpleRoute>
                          <UniversityProfile />
                        </SimpleRoute>
                      }
                    />
                    <Route
                      path="/study-resources"
                      element={
                        <SimpleRoute>
                          <StudyResources />
                        </SimpleRoute>
                      }
                    />
                    <Route
                      path="/study-tips"
                      element={
                        <SimpleRoute>
                          <StudyResources />
                        </SimpleRoute>
                      }
                    />
                    <Route
                      path="/aps-demo"
                      element={
                        <SimpleRoute>
                          <APSDemo />
                        </SimpleRoute>
                      }
                    />
                    <Route
                      path="/system-status"
                      element={
                        <SimpleRoute>
                          <SystemStatus />
                        </SimpleRoute>
                      }
                    />

                    {/* Shopping and Cart Routes */}
                    <Route
                      path="/cart"
                      element={
                        <SimpleRoute>
                          <Cart />
                        </SimpleRoute>
                      }
                    />
                    <Route
                      path="/checkout/:id"
                      element={
                        <SimpleRoute>
                          <Checkout />
                        </SimpleRoute>
                      }
                    />
                    <Route
                      path="/checkout/cart"
                      element={
                        <SimpleRoute>
                          <Checkout />
                        </SimpleRoute>
                      }
                    />
                    <Route
                      path="/shipping"
                      element={
                        <SimpleRoute>
                          <Shipping />
                        </SimpleRoute>
                      }
                    />
                    <Route
                      path="/payment-callback"
                      element={
                        <SimpleRoute>
                          <PaymentCallback />
                        </SimpleRoute>
                      }
                    />
                    <Route
                      path="/payments"
                      element={
                        <SimpleRoute>
                          <ProtectedRoute>
                            <PaymentDashboard />
                          </ProtectedRoute>
                        </SimpleRoute>
                      }
                    />

                    {/* Support and Info Pages */}
                    <Route
                      path="/contact"
                      element={
                        <SimpleRoute>
                          <ContactUs />
                        </SimpleRoute>
                      }
                    />
                    <Route
                      path="/faq"
                      element={
                        <SimpleRoute>
                          <FAQ />
                        </SimpleRoute>
                      }
                    />
                    <Route
                      path="/policies"
                      element={
                        <SimpleRoute>
                          <Policies />
                        </SimpleRoute>
                      }
                    />
                    <Route
                      path="/privacy"
                      element={
                        <SimpleRoute>
                          <Privacy />
                        </SimpleRoute>
                      }
                    />
                    <Route
                      path="/terms"
                      element={
                        <SimpleRoute>
                          <Terms />
                        </SimpleRoute>
                      }
                    />
                    <Route
                      path="/google-maps-demo"
                      element={
                        <SimpleRoute>
                          <GoogleMapsDemo />
                        </SimpleRoute>
                      }
                    />
                    <Route
                      path="/maps-test"
                      element={
                        <SimpleRoute>
                          <MapsTest />
                        </SimpleRoute>
                      }
                    />
                    <Route
                      path="/basic-maps"
                      element={
                        <SimpleRoute>
                          <BasicMapsExample />
                        </SimpleRoute>
                      }
                    />
                    <Route
                      path="/working-maps"
                      element={
                        <SimpleRoute>
                          <WorkingMapsDemo />
                        </SimpleRoute>
                      }
                    />

                    {/* Protected Routes */}
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <SimpleRoute>
                            <Profile />
                          </SimpleRoute>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/user-profile"
                      element={
                        <ProtectedRoute>
                          <SimpleRoute>
                            <UserProfile />
                          </SimpleRoute>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/create-listing"
                      element={
                        <ProtectedRoute>
                          <SimpleRoute>
                            <CreateListing />
                          </SimpleRoute>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/edit-book/:id"
                      element={
                        <ProtectedRoute>
                          <SimpleRoute>
                            <EditBook />
                          </SimpleRoute>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/notifications"
                      element={
                        <ProtectedRoute>
                          <SimpleRoute>
                            <Notifications />
                          </SimpleRoute>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/activity"
                      element={
                        <ProtectedRoute>
                          <SimpleRoute>
                            <ActivityLog />
                          </SimpleRoute>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/report"
                      element={
                        <ProtectedRoute>
                          <SimpleRoute>
                            <Report />
                          </SimpleRoute>
                        </ProtectedRoute>
                      }
                    />

                    {/* Admin Routes */}
                    <Route
                      path="/admin"
                      element={
                        <AdminProtectedRoute>
                          <SimpleRoute>
                            <Admin />
                          </SimpleRoute>
                        </AdminProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/reports"
                      element={
                        <AdminProtectedRoute>
                          <SimpleRoute>
                            <AdminReports />
                          </SimpleRoute>
                        </AdminProtectedRoute>
                      }
                    />

                    <Route
                      path="*"
                      element={
                        <SimpleRoute>
                          <NotFound />
                        </SimpleRoute>
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
