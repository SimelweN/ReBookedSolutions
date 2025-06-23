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
import "./App.css";

// Initialize debug utilities in development
if (import.meta.env.DEV) {
  (window as any).debugConnection = debugConnection;
  (window as any).validateApiKey = validateApiKey;
  (window as any).PaymentTester = PaymentTester;
  (window as any).testPaymentSetup = testPaymentSetup;
  console.log("🛠️ Debug utilities available:");
  console.log("  - debugConnection() - Full connection test");
  console.log("  - validateApiKey() - Check API key validity");
  console.log("  - PaymentTester.testPaymentSystem() - Test payment setup");
  console.log(
    "  - testPaymentSetup() - Test user requirements for listing books",
  );
}

// Lazy load components for better performance
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

// Lazy route wrapper with error boundary
const LazyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary level="route">
    <Suspense fallback={<PageLoader />}>{children}</Suspense>
  </ErrorBoundary>
);

function App() {
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
                        <LazyRoute>
                          <Index />
                        </LazyRoute>
                      }
                    />
                    <Route
                      path="/books"
                      element={
                        <LazyRoute>
                          <BookListing />
                        </LazyRoute>
                      }
                    />
                    <Route
                      path="/books/:id"
                      element={
                        <LazyRoute>
                          <BookDetails />
                        </LazyRoute>
                      }
                    />
                    <Route
                      path="/book/:id"
                      element={
                        <LazyRoute>
                          <BookDetails />
                        </LazyRoute>
                      }
                    />
                    <Route
                      path="/login"
                      element={
                        <LazyRoute>
                          <Login />
                        </LazyRoute>
                      }
                    />
                    <Route
                      path="/register"
                      element={
                        <LazyRoute>
                          <Register />
                        </LazyRoute>
                      }
                    />
                    <Route
                      path="/forgot-password"
                      element={
                        <LazyRoute>
                          <ForgotPassword />
                        </LazyRoute>
                      }
                    />
                    <Route
                      path="/reset-password"
                      element={
                        <LazyRoute>
                          <ResetPassword />
                        </LazyRoute>
                      }
                    />
                    <Route
                      path="/verify"
                      element={
                        <LazyRoute>
                          <Verify />
                        </LazyRoute>
                      }
                    />
                    <Route
                      path="/confirm"
                      element={
                        <LazyRoute>
                          <Confirm />
                        </LazyRoute>
                      }
                    />
                    <Route
                      path="/confirm-email-change"
                      element={
                        <LazyRoute>
                          <ConfirmEmailChange />
                        </LazyRoute>
                      }
                    />

                    {/* University and Campus Routes */}
                    <Route
                      path="/university-info"
                      element={
                        <LazyRoute>
                          <UniversityInfo />
                        </LazyRoute>
                      }
                    />
                    <Route
                      path="/university-profile"
                      element={
                        <LazyRoute>
                          <ModernUniversityProfile />
                        </LazyRoute>
                      }
                    />
                    <Route
                      path="/university/:id"
                      element={
                        <LazyRoute>
                          <UniversityProfile />
                        </LazyRoute>
                      }
                    />
                    <Route
                      path="/study-resources"
                      element={
                        <LazyRoute>
                          <StudyResources />
                        </LazyRoute>
                      }
                    />
                    <Route
                      path="/study-tips"
                      element={
                        <LazyRoute>
                          <StudyResources />
                        </LazyRoute>
                      }
                    />
                    <Route
                      path="/aps-demo"
                      element={
                        <LazyRoute>
                          <APSDemo />
                        </LazyRoute>
                      }
                    />

                    {/* Shopping and Cart Routes */}
                    <Route
                      path="/cart"
                      element={
                        <LazyRoute>
                          <Cart />
                        </LazyRoute>
                      }
                    />
                    <Route
                      path="/checkout/:id"
                      element={
                        <LazyRoute>
                          <Checkout />
                        </LazyRoute>
                      }
                    />
                    <Route
                      path="/checkout/cart"
                      element={
                        <LazyRoute>
                          <Checkout />
                        </LazyRoute>
                      }
                    />
                    <Route
                      path="/shipping"
                      element={
                        <LazyRoute>
                          <Shipping />
                        </LazyRoute>
                      }
                    />
                    <Route
                      path="/payment-callback"
                      element={
                        <LazyRoute>
                          <PaymentCallback />
                        </LazyRoute>
                      }
                    />
                    <Route
                      path="/payments"
                      element={
                        <LazyRoute>
                          <ProtectedRoute>
                            <PaymentDashboard />
                          </ProtectedRoute>
                        </LazyRoute>
                      }
                    />

                    {/* Support and Info Pages */}
                    <Route
                      path="/contact"
                      element={
                        <LazyRoute>
                          <ContactUs />
                        </LazyRoute>
                      }
                    />
                    <Route
                      path="/faq"
                      element={
                        <LazyRoute>
                          <FAQ />
                        </LazyRoute>
                      }
                    />
                    <Route
                      path="/policies"
                      element={
                        <LazyRoute>
                          <Policies />
                        </LazyRoute>
                      }
                    />
                    <Route
                      path="/privacy"
                      element={
                        <LazyRoute>
                          <Privacy />
                        </LazyRoute>
                      }
                    />
                    <Route
                      path="/terms"
                      element={
                        <LazyRoute>
                          <Terms />
                        </LazyRoute>
                      }
                    />
                    <Route
                      path="/google-maps-demo"
                      element={
                        <LazyRoute>
                          <GoogleMapsDemo />
                        </LazyRoute>
                      }
                    />
                    <Route
                      path="/maps-test"
                      element={
                        <LazyRoute>
                          <MapsTest />
                        </LazyRoute>
                      }
                    />
                    <Route
                      path="/basic-maps"
                      element={
                        <LazyRoute>
                          <BasicMapsExample />
                        </LazyRoute>
                      }
                    />
                    <Route
                      path="/working-maps"
                      element={
                        <LazyRoute>
                          <WorkingMapsDemo />
                        </LazyRoute>
                      }
                    />

                    {/* Protected Routes */}
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <LazyRoute>
                            <Profile />
                          </LazyRoute>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/user-profile"
                      element={
                        <ProtectedRoute>
                          <LazyRoute>
                            <UserProfile />
                          </LazyRoute>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/create-listing"
                      element={
                        <ProtectedRoute>
                          <LazyRoute>
                            <CreateListing />
                          </LazyRoute>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/edit-book/:id"
                      element={
                        <ProtectedRoute>
                          <LazyRoute>
                            <EditBook />
                          </LazyRoute>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/notifications"
                      element={
                        <ProtectedRoute>
                          <LazyRoute>
                            <Notifications />
                          </LazyRoute>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/activity"
                      element={
                        <ProtectedRoute>
                          <LazyRoute>
                            <ActivityLog />
                          </LazyRoute>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/report"
                      element={
                        <ProtectedRoute>
                          <LazyRoute>
                            <Report />
                          </LazyRoute>
                        </ProtectedRoute>
                      }
                    />

                    {/* Admin Routes */}
                    <Route
                      path="/admin"
                      element={
                        <AdminProtectedRoute>
                          <LazyRoute>
                            <Admin />
                          </LazyRoute>
                        </AdminProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/reports"
                      element={
                        <AdminProtectedRoute>
                          <LazyRoute>
                            <AdminReports />
                          </LazyRoute>
                        </AdminProtectedRoute>
                      }
                    />

                    <Route
                      path="*"
                      element={
                        <LazyRoute>
                          <NotFound />
                        </LazyRoute>
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

export default App;
