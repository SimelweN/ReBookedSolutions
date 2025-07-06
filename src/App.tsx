import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import GoogleMapsProvider from "./contexts/GoogleMapsContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import { Toaster } from "@/components/ui/sonner";
import "./App.css";

// Development: Import test utilities (remove in production)
if (process.env.NODE_ENV === "development") {
  import("./utils/testOrderSystem").then((module) => {
    (window as any).testOrderSystem = module.testOrderSystem;
    (window as any).checkDatabaseStatus = module.checkDatabaseStatus;
    console.log(
      "🧪 Order system test utilities loaded. Run testOrderSystem() or checkDatabaseStatus() in console.",
    );
  });

  // Load migration verification utility
  import("./utils/verifyMigration").then((module) => {
    (window as any).verifyMigration = module.verifyMigration;
    console.log(
      "🔍 Migration verification loaded. Run verifyMigration() to check if migration was successful.",
    );
  });
}

// Import critical pages directly
import IndexPage from "./pages/Index";
import UniversityInfoPage from "./pages/UniversityInfo";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import AdminPage from "./pages/Admin";

// Lazy load other pages
const BookListing = React.lazy(() => import("./pages/BookListing"));
const BookDetails = React.lazy(() => import("./pages/BookDetails"));
const Profile = React.lazy(() => import("./pages/Profile"));
const CreateListing = React.lazy(() => import("./pages/CreateListing"));
const Cart = React.lazy(() => import("./pages/Cart"));
const Checkout = React.lazy(() => import("./pages/Checkout"));
const Shipping = React.lazy(() => import("./pages/Shipping"));
const ContactUs = React.lazy(() => import("./pages/ContactUs"));
const FAQ = React.lazy(() => import("./pages/FAQ"));

// QA Dashboards
const SimpleQADashboard = React.lazy(() => import("./pages/SimpleQADashboard"));
const QADashboard = React.lazy(() => import("./pages/QADashboard"));
const EnhancedQADashboard = React.lazy(
  () => import("./pages/EnhancedQADashboard"),
);
const TestOrderSystemSimple = React.lazy(
  () => import("./pages/TestOrderSystemSimple"),
);
const OrderSystemTests = React.lazy(() => import("./pages/OrderSystemTests"));
const StudyResources = React.lazy(() => import("./pages/StudyResources"));
const UserProfile = React.lazy(() => import("./pages/UserProfile"));
const ActivityLog = React.lazy(() => import("./pages/ActivityLog"));
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
const EnhancedUniversityProfile = React.lazy(
  () => import("./pages/EnhancedUniversityProfile"),
);
const ModernUniversityProfile = React.lazy(
  () => import("./pages/ModernUniversityProfile"),
);

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-24">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
  </div>
);

function App() {
  return (
    <ErrorBoundary level="app">
      <ThemeProvider attribute="class" defaultTheme="light">
        <GoogleMapsProvider>
          <AuthProvider>
            <CartProvider>
              <Router>
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

                      {/* University Profile Routes */}
                      <Route
                        path="/university/:id"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <EnhancedUniversityProfile />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/university-profile"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <ModernUniversityProfile />
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
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <Suspense fallback={<LoadingSpinner />}>
                              <Profile />
                            </Suspense>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/user-profile"
                        element={
                          <ProtectedRoute>
                            <Suspense fallback={<LoadingSpinner />}>
                              <UserProfile />
                            </Suspense>
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

                      {/* QA Dashboard Routes */}
                      <Route
                        path="/qa-dashboard"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <SimpleQADashboard />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/qa"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <QADashboard />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/qa-enhanced"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <EnhancedQADashboard />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/test-orders"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <TestOrderSystemSimple />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/order-tests"
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <OrderSystemTests />
                          </Suspense>
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
  );
}

export default App;
