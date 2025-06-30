import * as React from "react";
const { Suspense, startTransition } = React;
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
import ConfigurationChecker from "./components/ConfigurationChecker";
import { debugConnection } from "./utils/debugConnection";
import { validateApiKey } from "./utils/validateApiKey";
import { DatabaseSetup } from "./utils/databaseSetup";

import {
  checkDatabaseStatus,
  logDatabaseStatus,
} from "./utils/databaseConnectivityHelper";
import { preloadCriticalRoutes } from "./utils/routePreloader";
import { reportReactImportStatus } from "./utils/reactImportValidator";
import EmergencyBypass from "./components/EmergencyBypass";
import "./App.css";

// Initialize debug utilities in development only (limited)
if (import.meta.env.DEV) {
  // Only expose essential debugging tools in development
  (window as any).checkDatabaseStatus = checkDatabaseStatus;

  // Validate React imports immediately to catch createContext errors
  setTimeout(() => {
    console.log("🔍 Running React import validation...");
    const status = reportReactImportStatus();

    // Test createContext specifically
    if (status.createContextAvailable) {
      try {
        const testContext = React.createContext("test");
        console.log("✅ React.createContext test passed");
      } catch (error) {
        console.error("❌ React.createContext test failed:", error);
      }
    }
  }, 100);

  // Test NEW SUBJECT ENGINE - wrapped to prevent Suspense issues
  setTimeout(() => {
    try {
      import("./services/newSubjectEngine")
        .then(({ testNewEngine }) => {
          try {
            console.log("🔥 Testing NEW SUBJECT ENGINE...");
            testNewEngine();
            console.log("✅ Subject engine test completed successfully");
          } catch (testError) {
            console.warn("Subject engine test execution failed:", testError);
          }
        })
        .catch((importError) => {
          console.warn("Subject engine import failed:", importError);
        });
    } catch (error) {
      console.warn("Subject engine test setup failed:", error);
    }
  }, 3000); // Extended delay to prevent initialization conflicts

  // Minimal debug logging in development
  console.log("🛠️ Development mode active");
}

// Import critical pages directly for instant loading (prevents Suspense errors)
import IndexPage from "./pages/Index";
import UniversityInfoPage from "./pages/UniversityInfo";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import AdminPage from "./pages/Admin";
const Index = () => <IndexPage />;
const UniversityInfo = () => <UniversityInfoPage />;
const Login = () => <LoginPage />;
const Register = () => <RegisterPage />;
const Admin = () => <AdminPage />;

// Simple lazy loading for less critical pages
const BookListing = React.lazy(() => import("./pages/BookListing"));
const BookDetails = React.lazy(() => import("./pages/BookDetails"));
const Profile = React.lazy(() => import("./pages/Profile"));
const CreateListing = React.lazy(() => import("./pages/CreateListing"));
const GoogleMapsDemo = React.lazy(() => import("./pages/GoogleMapsDemo"));
const MapsTest = React.lazy(() => import("./pages/MapsTest"));
const BasicMapsExample = React.lazy(() => import("./pages/BasicMapsExample"));
const WorkingMapsDemo = React.lazy(() => import("./pages/WorkingMapsDemo"));
const AdminReports = React.lazy(() => import("./pages/AdminReports"));
const ModernUniversityProfile = React.lazy(
  () => import("./pages/ModernUniversityProfile"),
);
const UniversityProfile = React.lazy(() => import("./pages/UniversityProfile"));
const EnhancedUniversityProfile = React.lazy(
  () => import("./pages/EnhancedUniversityProfile"),
);
const Policies = React.lazy(() => import("./pages/Policies"));
const Privacy = React.lazy(() => import("./pages/Privacy"));
const Terms = React.lazy(() => import("./pages/Terms"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Cart = React.lazy(() => import("./pages/Cart"));
const Checkout = React.lazy(() => import("./pages/Checkout"));
const Shipping = React.lazy(() => import("./pages/Shipping"));
const Notifications = React.lazy(() => import("./pages/Notifications"));
const SimpleQADashboard = React.lazy(() => import("./pages/SimpleQADashboard"));
const QADashboard = React.lazy(() => import("./pages/QADashboard"));
const QAFunctionalityDashboard = React.lazy(
  () => import("./components/QADashboard"),
);
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
const AddProgram = React.lazy(() => import("./pages/AddProgram"));
const SystemStatus = React.lazy(() => import("./pages/SystemStatus"));
const CheckoutSuccess = React.lazy(() => import("./pages/CheckoutSuccess"));
const PaymentStatus = React.lazy(() => import("./pages/PaymentStatus"));
const PaymentCallback = React.lazy(() => import("./pages/PaymentCallback"));
const ActivityLog = React.lazy(() => import("./pages/ActivityLog"));
const PaystackTest = React.lazy(() => import("./pages/PaystackTest"));
const DeepClean = React.lazy(() => import("./pages/DeepClean"));

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

// Minimal loading component
const MinimalLoader = () => (
  <div className="flex items-center justify-center h-24">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
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

// Enhanced route wrapper for lazy components with proper error handling and transition management
const LazyWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [error, setError] = React.useState<Error | null>(null);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  React.useEffect(() => {
    // Reset error when children change
    setError(null);
    setIsTransitioning(true);

    // Use startTransition to prevent suspense issues during route changes
    startTransition(() => {
      setIsTransitioning(false);
    });
  }, [children]);

  const errorBoundary = React.useCallback((error: Error) => {
    setError(error);
    console.error("LazyWrapper caught error:", error);
    setIsTransitioning(false);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">
            Failed to load this page. Please try refreshing.
          </p>
          <button
            onClick={() => {
              setError(null);
              setIsTransitioning(false);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary level="route" onError={errorBoundary}>
      <Suspense fallback={<MinimalLoader />}>
        {isTransitioning ? <MinimalLoader /> : children}
      </Suspense>
    </ErrorBoundary>
  );
};

function App() {
  // Track initialization state to prevent suspense issues
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Initialize app and preload routes in the background
  React.useEffect(() => {
    // Set initialized immediately to prevent suspense
    setIsInitialized(true);

    // Use startTransition for non-urgent preloading
    startTransition(() => {
      preloadCriticalRoutes().catch((error) => {
        console.warn("Failed to preload routes:", error);
      });
    });
  }, []);

  // Add a minimal loading fallback for the initial render
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <EmergencyBypass>
      <ErrorBoundary level="app">
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" defaultTheme="light">
            <GoogleMapsProvider>
              <AuthProvider>
                <CartProvider>
                  <ErrorBoundary level="router">
                    <Suspense fallback={<MinimalLoader />}>
                      <Router>
                        <AuthErrorHandler />
                        <ScrollToTop />
                        <Routes>
                          {/* Home route - loads instantly */}
                          <Route path="/" element={<IndexPage />} />

                          {/* Public routes */}
                          <Route path="/register" element={<Register />} />
                          <Route
                            path="/user-profile"
                            element={<UserProfile />}
                          />
                          <Route path="/qa" element={<SimpleQADashboard />} />
                          <Route
                            path="/books"
                            element={
                              <LazyWrapper>
                                <BookListing />
                              </LazyWrapper>
                            }
                          />
                          <Route
                            path="/books/:id"
                            element={
                              <LazyWrapper>
                                <BookDetails />
                              </LazyWrapper>
                            }
                          />
                          <Route
                            path="/book/:id"
                            element={
                              <LazyWrapper>
                                <BookDetails />
                              </LazyWrapper>
                            }
                          />
                          <Route
                            path="/login"
                            element={
                              <LazyWrapper>
                                <Login />
                              </LazyWrapper>
                            }
                          />
                          <Route
                            path="/register"
                            element={
                              <LazyWrapper>
                                <Register />
                              </LazyWrapper>
                            }
                          />
                          <Route
                            path="/forgot-password"
                            element={
                              <LazyWrapper>
                                <ForgotPassword />
                              </LazyWrapper>
                            }
                          />
                          <Route
                            path="/reset-password"
                            element={
                              <LazyWrapper>
                                <ResetPassword />
                              </LazyWrapper>
                            }
                          />
                          <Route
                            path="/verify"
                            element={
                              <LazyWrapper>
                                <Verify />
                              </LazyWrapper>
                            }
                          />
                          <Route
                            path="/confirm"
                            element={
                              <LazyWrapper>
                                <Confirm />
                              </LazyWrapper>
                            }
                          />
                          <Route
                            path="/confirm-email-change"
                            element={
                              <LazyWrapper>
                                <ConfirmEmailChange />
                              </LazyWrapper>
                            }
                          />

                          {/* University and Campus Routes */}
                          <Route
                            path="/university-info"
                            element={<UniversityInfo />}
                          />
                          <Route
                            path="/university-profile"
                            element={
                              <LazyWrapper>
                                <ModernUniversityProfile />
                              </LazyWrapper>
                            }
                          />
                          <Route
                            path="/university/:id"
                            element={
                              <LazyWrapper>
                                <EnhancedUniversityProfile />
                              </LazyWrapper>
                            }
                          />
                          <Route
                            path="/study-resources"
                            element={
                              <LazyWrapper>
                                <StudyResources />
                              </LazyWrapper>
                            }
                          />
                          <Route
                            path="/study-tips"
                            element={
                              <LazyWrapper>
                                <StudyResources />
                              </LazyWrapper>
                            }
                          />
                          <Route
                            path="/aps-demo"
                            element={
                              <LazyWrapper>
                                <APSDemo />
                              </LazyWrapper>
                            }
                          />
                          <Route
                            path="/add-program"
                            element={
                              <LazyWrapper>
                                <AddProgram />
                              </LazyWrapper>
                            }
                          />
                          <Route
                            path="/paystack-test"
                            element={
                              <LazyWrapper>
                                <PaystackTest />
                              </LazyWrapper>
                            }
                          />
                          <Route
                            path="/deep-clean"
                            element={
                              <LazyWrapper>
                                <DeepClean />
                              </LazyWrapper>
                            }
                          />

                          {/* Shopping and Cart Routes */}
                          <Route
                            path="/cart"
                            element={
                              <LazyWrapper>
                                <Cart />
                              </LazyWrapper>
                            }
                          />

                          <Route
                            path="/shipping"
                            element={
                              <LazyWrapper>
                                <Shipping />
                              </LazyWrapper>
                            }
                          />

                          {/* Support and Info Pages */}
                          <Route
                            path="/contact"
                            element={
                              <LazyWrapper>
                                <ContactUs />
                              </LazyWrapper>
                            }
                          />
                          <Route
                            path="/faq"
                            element={
                              <LazyWrapper>
                                <FAQ />
                              </LazyWrapper>
                            }
                          />
                          <Route
                            path="/policies"
                            element={
                              <LazyWrapper>
                                <Policies />
                              </LazyWrapper>
                            }
                          />
                          <Route
                            path="/privacy"
                            element={
                              <LazyWrapper>
                                <Privacy />
                              </LazyWrapper>
                            }
                          />
                          <Route
                            path="/terms"
                            element={
                              <LazyWrapper>
                                <Terms />
                              </LazyWrapper>
                            }
                          />
                          <Route
                            path="/system-status"
                            element={
                              <LazyWrapper>
                                <SystemStatus />
                              </LazyWrapper>
                            }
                          />

                          {/* Maps demo routes */}
                          <Route
                            path="/google-maps-demo"
                            element={
                              <LazyWrapper>
                                <GoogleMapsDemo />
                              </LazyWrapper>
                            }
                          />
                          <Route
                            path="/maps-test"
                            element={
                              <LazyWrapper>
                                <MapsTest />
                              </LazyWrapper>
                            }
                          />
                          <Route
                            path="/basic-maps"
                            element={
                              <LazyWrapper>
                                <BasicMapsExample />
                              </LazyWrapper>
                            }
                          />
                          <Route
                            path="/working-maps"
                            element={
                              <LazyWrapper>
                                <WorkingMapsDemo />
                              </LazyWrapper>
                            }
                          />

                          {/* Protected Routes */}
                          <Route
                            path="/user-profile"
                            element={<UserProfile />}
                          />
                          <Route path="/qa" element={<SimpleQADashboard />} />
                          <Route
                            path="/books"
                            element={
                              <LazyWrapper>
                                <BookListing />
                              </LazyWrapper>
                            }
                          />
                          <Route
                            path="/qa-dashboard"
                            element={
                              <ProtectedRoute>
                                <LazyWrapper>
                                  <QADashboard />
                                </LazyWrapper>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/user-profile"
                            element={
                              <ProtectedRoute>
                                <LazyWrapper>
                                  <UserProfile />
                                </LazyWrapper>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/create-listing"
                            element={
                              <ProtectedRoute>
                                <LazyWrapper>
                                  <CreateListing />
                                </LazyWrapper>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/edit-book/:id"
                            element={
                              <ProtectedRoute>
                                <LazyWrapper>
                                  <EditBook />
                                </LazyWrapper>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/checkout"
                            element={
                              <ProtectedRoute>
                                <LazyWrapper>
                                  <Checkout />
                                </LazyWrapper>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/checkout/success"
                            element={
                              <ProtectedRoute>
                                <LazyWrapper>
                                  <CheckoutSuccess />
                                </LazyWrapper>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/payment-status/:orderId?"
                            element={
                              <ProtectedRoute>
                                <LazyWrapper>
                                  <PaymentStatus />
                                </LazyWrapper>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/payment-callback"
                            element={
                              <LazyWrapper>
                                <PaymentCallback />
                              </LazyWrapper>
                            }
                          />
                          <Route
                            path="/notifications"
                            element={
                              <ProtectedRoute>
                                <LazyWrapper>
                                  <Notifications />
                                </LazyWrapper>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/profile"
                            element={
                              <ProtectedRoute>
                                <LazyWrapper>
                                  <Profile />
                                </LazyWrapper>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/activity"
                            element={
                              <ProtectedRoute>
                                <LazyWrapper>
                                  <ActivityLog />
                                </LazyWrapper>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/report"
                            element={
                              <ProtectedRoute>
                                <LazyWrapper>
                                  <Report />
                                </LazyWrapper>
                              </ProtectedRoute>
                            }
                          />

                          {/* Admin Routes */}
                          <Route
                            path="/qa-dashboard"
                            element={
                              <LazyWrapper>
                                <QADashboard />
                              </LazyWrapper>
                            }
                          />
                          <Route
                            path="/qa-functionality"
                            element={
                              <LazyWrapper>
                                <QAFunctionalityDashboard />
                              </LazyWrapper>
                            }
                          />
                          <Route
                            path="/admin"
                            element={
                              <AdminProtectedRoute>
                                <LazyWrapper>
                                  <Admin />
                                </LazyWrapper>
                              </AdminProtectedRoute>
                            }
                          />
                          <Route
                            path="/admin/reports"
                            element={
                              <AdminProtectedRoute>
                                <LazyWrapper>
                                  <AdminReports />
                                </LazyWrapper>
                              </AdminProtectedRoute>
                            }
                          />

                          {/* 404 Route */}
                          <Route
                            path="*"
                            element={
                              <LazyWrapper>
                                <NotFound />
                              </LazyWrapper>
                            }
                          />
                        </Routes>
                      </Router>
                    </Suspense>
                  </ErrorBoundary>
                </CartProvider>
              </AuthProvider>
            </GoogleMapsProvider>

            {/* Configuration checker for development only */}
            {import.meta.env.DEV && false && <ConfigurationChecker />}

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
  console.log("🎉 ReBooked Solutions frontend is ready!");
  console.log("📚 Book listing and user management system");
}

export default App;
