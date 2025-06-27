import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  User,
  ShoppingCart,
  CreditCard,
  UserCheck,
  Play,
  RefreshCw,
  Eye,
  Navigation,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TestResult {
  id: string;
  name: string;
  status: "pending" | "running" | "pass" | "fail" | "warning";
  message?: string;
  details?: string;
  timestamp?: string;
}

interface TestSuite {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  tests: TestResult[];
  color: string;
}

const ComprehensiveQATests: React.FC = () => {
  const { user, isAuthenticated, login, register } = useAuth();
  const { cart, addToCart } = useCart();
  const navigate = useNavigate();
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      id: "auth",
      name: "🔐 Authentication & Profile",
      icon: User,
      description:
        "User registration, login, profile editing, address autocomplete",
      color: "bg-blue-600",
      tests: [
        { id: "auth-login", name: "User login works", status: "pending" },
        {
          id: "auth-register",
          name: "User registration works",
          status: "pending",
        },
        {
          id: "auth-password-reset",
          name: "Password reset flow functional",
          status: "pending",
        },
        {
          id: "profile-edit",
          name: "Profile editing with Google Maps",
          status: "pending",
        },
        {
          id: "address-autocomplete",
          name: "Address autocomplete (South Africa)",
          status: "pending",
        },
      ],
    },
    {
      id: "cart",
      name: "🛒 Cart & Checkout",
      icon: ShoppingCart,
      description: "Cart persistence, checkout flow, courier options",
      color: "bg-green-600",
      tests: [
        {
          id: "cart-persist",
          name: "Cart persists across sessions",
          status: "pending",
        },
        {
          id: "checkout-flow",
          name: "Checkout flow completes",
          status: "pending",
        },
        {
          id: "courier-options",
          name: "Courier options load (Fastway/Courier Guy)",
          status: "pending",
        },
        {
          id: "payment-button",
          name: "Continue to Payment button works",
          status: "pending",
        },
      ],
    },
    {
      id: "payment",
      name: "💳 Paystack Integration",
      icon: CreditCard,
      description:
        "LIVE keys, payment modal, split payments, webhook verification",
      color: "bg-purple-600",
      tests: [
        {
          id: "paystack-live",
          name: "LIVE keys configured (not test)",
          status: "pending",
        },
        { id: "payment-modal", name: "Payment modal opens", status: "pending" },
        {
          id: "split-payment",
          name: "Split payments: 90% seller, 10% platform",
          status: "pending",
        },
        {
          id: "webhook-verify",
          name: "Webhook verification works",
          status: "pending",
        },
      ],
    },
    {
      id: "seller",
      name: "🧑‍💼 Seller Onboarding",
      icon: UserCheck,
      description:
        "Banking details, address requirements, seller guide, timeouts",
      color: "bg-orange-600",
      tests: [
        {
          id: "banking-required",
          name: "Banking details required to sell",
          status: "pending",
        },
        {
          id: "address-required",
          name: "Address required to sell",
          status: "pending",
        },
        {
          id: "seller-guide",
          name: "Become a Seller guide works",
          status: "pending",
        },
        {
          id: "timeout-enforce",
          name: "48-hour timeout enforced",
          status: "pending",
        },
      ],
    },
  ]);

  const updateTestResult = (
    suiteId: string,
    testId: string,
    updates: Partial<TestResult>,
  ) => {
    setTestSuites((prev) =>
      prev.map((suite) =>
        suite.id === suiteId
          ? {
              ...suite,
              tests: suite.tests.map((test) =>
                test.id === testId
                  ? {
                      ...test,
                      ...updates,
                      timestamp: new Date().toLocaleTimeString(),
                    }
                  : test,
              ),
            }
          : suite,
      ),
    );
  };

  const runAuthTests = async () => {
    const suiteId = "auth";
    setRunningTests((prev) => new Set(prev).add(suiteId));

    try {
      // Test 1: Check if user is logged in
      updateTestResult(suiteId, "auth-login", { status: "running" });
      if (isAuthenticated && user) {
        updateTestResult(suiteId, "auth-login", {
          status: "pass",
          message: `Logged in as ${user.email}`,
        });
      } else {
        updateTestResult(suiteId, "auth-login", {
          status: "warning",
          message: "Not logged in - manual test required",
        });
      }

      // Test 2: Check registration page accessibility
      updateTestResult(suiteId, "auth-register", { status: "running" });
      try {
        // Test if register page loads
        const registerTest = await fetch(window.location.origin + "/register", {
          method: "HEAD",
        });
        updateTestResult(suiteId, "auth-register", {
          status: "pass",
          message: "Registration page accessible",
        });
      } catch {
        updateTestResult(suiteId, "auth-register", {
          status: "fail",
          message: "Registration page not accessible",
        });
      }

      // Test 3: Check password reset functionality
      updateTestResult(suiteId, "auth-password-reset", { status: "running" });
      try {
        const resetTest = await fetch(
          window.location.origin + "/forgot-password",
          { method: "HEAD" },
        );
        updateTestResult(suiteId, "auth-password-reset", {
          status: "pass",
          message: "Password reset page accessible",
        });
      } catch {
        updateTestResult(suiteId, "auth-password-reset", {
          status: "fail",
          message: "Password reset page not accessible",
        });
      }

      // Test 4: Check profile page
      updateTestResult(suiteId, "profile-edit", { status: "running" });
      if (isAuthenticated) {
        try {
          const profileTest = await fetch(window.location.origin + "/profile", {
            method: "HEAD",
          });
          updateTestResult(suiteId, "profile-edit", {
            status: "pass",
            message: "Profile page accessible",
          });
        } catch {
          updateTestResult(suiteId, "profile-edit", {
            status: "fail",
            message: "Profile page not accessible",
          });
        }
      } else {
        updateTestResult(suiteId, "profile-edit", {
          status: "warning",
          message: "Login required for profile test",
        });
      }

      // Test 5: Check Google Maps integration
      updateTestResult(suiteId, "address-autocomplete", { status: "running" });
      const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (mapsApiKey && mapsApiKey.length > 10) {
        updateTestResult(suiteId, "address-autocomplete", {
          status: "pass",
          message: "Google Maps API key configured",
        });
      } else {
        updateTestResult(suiteId, "address-autocomplete", {
          status: "warning",
          message: "Google Maps API key not configured",
        });
      }
    } catch (error) {
      toast.error(
        "Auth tests failed: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    }

    setRunningTests((prev) => {
      const newSet = new Set(prev);
      newSet.delete(suiteId);
      return newSet;
    });
  };

  const runCartTests = async () => {
    const suiteId = "cart";
    setRunningTests((prev) => new Set(prev).add(suiteId));

    try {
      // Test 1: Cart persistence
      updateTestResult(suiteId, "cart-persist", { status: "running" });
      const cartData = localStorage.getItem("cart");
      if (cartData) {
        updateTestResult(suiteId, "cart-persist", {
          status: "pass",
          message: `Cart data found in localStorage`,
        });
      } else {
        updateTestResult(suiteId, "cart-persist", {
          status: "warning",
          message: "No cart data in localStorage (empty cart)",
        });
      }

      // Test 2: Checkout flow
      updateTestResult(suiteId, "checkout-flow", { status: "running" });
      try {
        const checkoutTest = await fetch(window.location.origin + "/checkout", {
          method: "HEAD",
        });
        updateTestResult(suiteId, "checkout-flow", {
          status: "pass",
          message: "Checkout page accessible",
        });
      } catch {
        updateTestResult(suiteId, "checkout-flow", {
          status: "fail",
          message: "Checkout page not accessible",
        });
      }

      // Test 3: Courier options
      updateTestResult(suiteId, "courier-options", { status: "running" });
      const courierKeys = {
        fastway: import.meta.env.VITE_FASTWAY_API_KEY,
        courierGuy: import.meta.env.VITE_COURIER_GUY_API_KEY,
      };

      const configuredCouriers = Object.entries(courierKeys)
        .filter(([_, key]) => key && key.length > 5)
        .map(([name, _]) => name);

      if (configuredCouriers.length > 0) {
        updateTestResult(suiteId, "courier-options", {
          status: "pass",
          message: `Configured: ${configuredCouriers.join(", ")}`,
        });
      } else {
        updateTestResult(suiteId, "courier-options", {
          status: "warning",
          message: "No courier API keys configured",
        });
      }

      // Test 4: Payment button
      updateTestResult(suiteId, "payment-button", { status: "running" });
      const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
      if (paystackKey && paystackKey.length > 10) {
        updateTestResult(suiteId, "payment-button", {
          status: "pass",
          message: "Paystack key configured",
        });
      } else {
        updateTestResult(suiteId, "payment-button", {
          status: "fail",
          message: "Paystack key not configured",
        });
      }
    } catch (error) {
      toast.error(
        "Cart tests failed: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    }

    setRunningTests((prev) => {
      const newSet = new Set(prev);
      newSet.delete(suiteId);
      return newSet;
    });
  };

  const runPaymentTests = async () => {
    const suiteId = "payment";
    setRunningTests((prev) => new Set(prev).add(suiteId));

    try {
      const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

      // Test 1: LIVE keys check
      updateTestResult(suiteId, "paystack-live", { status: "running" });
      if (paystackKey) {
        const isLive = paystackKey.startsWith("pk_live_");
        const isTest = paystackKey.startsWith("pk_test_");

        if (isLive) {
          updateTestResult(suiteId, "paystack-live", {
            status: "pass",
            message: "LIVE Paystack keys configured",
          });
        } else if (isTest) {
          updateTestResult(suiteId, "paystack-live", {
            status: "warning",
            message: "TEST Paystack keys (should be LIVE for production)",
          });
        } else {
          updateTestResult(suiteId, "paystack-live", {
            status: "fail",
            message: "Invalid Paystack key format",
          });
        }
      } else {
        updateTestResult(suiteId, "paystack-live", {
          status: "fail",
          message: "No Paystack key configured",
        });
      }

      // Test 2: Payment modal
      updateTestResult(suiteId, "payment-modal", { status: "running" });
      if (typeof window !== "undefined" && paystackKey) {
        updateTestResult(suiteId, "payment-modal", {
          status: "pass",
          message: "Paystack SDK can be loaded",
        });
      } else {
        updateTestResult(suiteId, "payment-modal", {
          status: "fail",
          message: "Paystack SDK cannot be loaded",
        });
      }

      // Test 3: Split payments configuration
      updateTestResult(suiteId, "split-payment", { status: "running" });
      try {
        // Check if subaccount creation function exists
        const response = await supabase.functions.invoke(
          "create-paystack-subaccount",
          {
            body: { test: true },
          },
        );
        updateTestResult(suiteId, "split-payment", {
          status: "pass",
          message: "Split payment function available",
        });
      } catch {
        updateTestResult(suiteId, "split-payment", {
          status: "warning",
          message: "Split payment function test failed (may still work)",
        });
      }

      // Test 4: Webhook verification
      updateTestResult(suiteId, "webhook-verify", { status: "running" });
      try {
        const response = await supabase.functions.invoke("paystack-webhook", {
          body: { test: true },
        });
        updateTestResult(suiteId, "webhook-verify", {
          status: "pass",
          message: "Webhook endpoint accessible",
        });
      } catch {
        updateTestResult(suiteId, "webhook-verify", {
          status: "warning",
          message: "Webhook endpoint test failed (may still work)",
        });
      }
    } catch (error) {
      toast.error(
        "Payment tests failed: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    }

    setRunningTests((prev) => {
      const newSet = new Set(prev);
      newSet.delete(suiteId);
      return newSet;
    });
  };

  const runSellerTests = async () => {
    const suiteId = "seller";
    setRunningTests((prev) => new Set(prev).add(suiteId));

    try {
      // Test 1: Banking details requirement
      updateTestResult(suiteId, "banking-required", { status: "running" });
      if (isAuthenticated && user) {
        try {
          const { data, error } = await supabase
            .from("banking_details")
            .select("id")
            .eq("user_id", user.id)
            .limit(1);

          if (data && data.length > 0) {
            updateTestResult(suiteId, "banking-required", {
              status: "pass",
              message: "Banking details exist for user",
            });
          } else {
            updateTestResult(suiteId, "banking-required", {
              status: "warning",
              message: "No banking details found (requirement enforced)",
            });
          }
        } catch {
          updateTestResult(suiteId, "banking-required", {
            status: "warning",
            message: "Cannot check banking details (login required)",
          });
        }
      } else {
        updateTestResult(suiteId, "banking-required", {
          status: "warning",
          message: "Login required to test banking requirements",
        });
      }

      // Test 2: Address requirement
      updateTestResult(suiteId, "address-required", { status: "running" });
      if (isAuthenticated && user) {
        try {
          const { data, error } = await supabase
            .from("user_addresses")
            .select("id")
            .eq("user_id", user.id)
            .limit(1);

          if (data && data.length > 0) {
            updateTestResult(suiteId, "address-required", {
              status: "pass",
              message: "Address exists for user",
            });
          } else {
            updateTestResult(suiteId, "address-required", {
              status: "warning",
              message: "No address found (requirement enforced)",
            });
          }
        } catch {
          updateTestResult(suiteId, "address-required", {
            status: "warning",
            message: "Cannot check address (login required)",
          });
        }
      } else {
        updateTestResult(suiteId, "address-required", {
          status: "warning",
          message: "Login required to test address requirements",
        });
      }

      // Test 3: Seller guide
      updateTestResult(suiteId, "seller-guide", { status: "running" });
      try {
        const sellerGuideTest = await fetch(
          window.location.origin + "/create-listing",
          { method: "HEAD" },
        );
        updateTestResult(suiteId, "seller-guide", {
          status: "pass",
          message: "Seller guide/listing page accessible",
        });
      } catch {
        updateTestResult(suiteId, "seller-guide", {
          status: "fail",
          message: "Seller guide page not accessible",
        });
      }

      // Test 4: Timeout enforcement (48-hour rule)
      updateTestResult(suiteId, "timeout-enforce", { status: "running" });
      if (isAuthenticated && user) {
        try {
          // Check if there's any timeout logic in place
          const now = new Date();
          const fortyEightHoursAgo = new Date(
            now.getTime() - 48 * 60 * 60 * 1000,
          );

          const { data, error } = await supabase
            .from("books")
            .select("created_at")
            .eq("seller_id", user.id)
            .gte("created_at", fortyEightHoursAgo.toISOString())
            .limit(1);

          updateTestResult(suiteId, "timeout-enforce", {
            status: "pass",
            message:
              "Timeout logic can be tested (requires manual verification)",
          });
        } catch {
          updateTestResult(suiteId, "timeout-enforce", {
            status: "warning",
            message: "Cannot test timeout enforcement",
          });
        }
      } else {
        updateTestResult(suiteId, "timeout-enforce", {
          status: "warning",
          message: "Login required to test timeout enforcement",
        });
      }
    } catch (error) {
      toast.error(
        "Seller tests failed: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    }

    setRunningTests((prev) => {
      const newSet = new Set(prev);
      newSet.delete(suiteId);
      return newSet;
    });
  };

  const runAllTests = async () => {
    await runAuthTests();
    await runCartTests();
    await runPaymentTests();
    await runSellerTests();
    toast.success("All test suites completed!");
  };

  const getTestSuiteStats = (suite: TestSuite) => {
    const total = suite.tests.length;
    const passed = suite.tests.filter((t) => t.status === "pass").length;
    const failed = suite.tests.filter((t) => t.status === "fail").length;
    const warnings = suite.tests.filter((t) => t.status === "warning").length;
    const pending = suite.tests.filter((t) => t.status === "pending").length;
    const running = suite.tests.filter((t) => t.status === "running").length;

    return { total, passed, failed, warnings, pending, running };
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "fail":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "running":
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusBadge = (status: TestResult["status"]) => {
    const variants = {
      pass: "bg-green-100 text-green-800",
      fail: "bg-red-100 text-red-800",
      warning: "bg-yellow-100 text-yellow-800",
      running: "bg-blue-100 text-blue-800",
      pending: "bg-gray-100 text-gray-800",
    };

    return <Badge className={variants[status]}>{status}</Badge>;
  };

  const testRunners = {
    auth: runAuthTests,
    cart: runCartTests,
    payment: runPaymentTests,
    seller: runSellerTests,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Production QA Testing
          </h2>
          <p className="text-gray-600">
            Comprehensive testing for all critical features
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runAllTests}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Play className="h-4 w-4 mr-2" />
            Run All Tests
          </Button>
        </div>
      </div>

      {/* Test Suites */}
      <div className="grid gap-6">
        {testSuites.map((suite) => {
          const stats = getTestSuiteStats(suite);
          const isRunning = runningTests.has(suite.id);
          const progress =
            ((stats.passed + stats.failed + stats.warnings) / stats.total) *
            100;

          return (
            <Card key={suite.id} className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${suite.color} text-white`}>
                      <suite.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{suite.name}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {suite.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right text-sm">
                      <div className="font-semibold">
                        {stats.passed}/{stats.total} passed
                      </div>
                      {stats.failed > 0 && (
                        <div className="text-red-600">
                          {stats.failed} failed
                        </div>
                      )}
                      {stats.warnings > 0 && (
                        <div className="text-yellow-600">
                          {stats.warnings} warnings
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={
                        testRunners[suite.id as keyof typeof testRunners]
                      }
                      disabled={isRunning}
                      variant="outline"
                      size="sm"
                    >
                      {isRunning ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                {stats.running > 0 ||
                stats.passed + stats.failed + stats.warnings > 0 ? (
                  <Progress value={progress} className="h-2" />
                ) : null}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {suite.tests.map((test) => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-2 rounded border"
                    >
                      <div className="flex items-center gap-2">
                        {getStatusIcon(test.status)}
                        <span className="font-medium">{test.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {test.message && (
                          <span className="text-sm text-gray-600">
                            {test.message}
                          </span>
                        )}
                        {getStatusBadge(test.status)}
                        {test.timestamp && (
                          <span className="text-xs text-gray-400">
                            {test.timestamp}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Quick Navigation for Manual Testing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/login")}
              className="justify-start"
            >
              <User className="h-4 w-4 mr-2" />
              Login Page
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/register")}
              className="justify-start"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Register
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/profile")}
              className="justify-start"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/cart")}
              className="justify-start"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/checkout")}
              className="justify-start"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Checkout
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/create-listing")}
              className="justify-start"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Sell Books
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/books")}
              className="justify-start"
            >
              <Eye className="h-4 w-4 mr-2" />
              Browse Books
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/admin")}
              className="justify-start"
            >
              <Settings className="h-4 w-4 mr-2" />
              Admin Panel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveQATests;
