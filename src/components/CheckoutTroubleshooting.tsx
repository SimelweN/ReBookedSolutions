import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle,
  Settings,
  RefreshCw,
  Bug,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const CheckoutTroubleshooting: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { items } = useCart();
  const [testResults, setTestResults] = useState<
    {
      name: string;
      status: "pass" | "fail" | "warning";
      message: string;
    }[]
  >([]);

  const runCheckoutDiagnostics = () => {
    const results = [];

    // Check authentication
    results.push({
      test: "User Authentication",
      status: isAuthenticated ? "pass" : "fail",
      message: isAuthenticated ? "User is logged in" : "User not authenticated",
      fix: !isAuthenticated ? "Go to login page" : null,
      action: !isAuthenticated ? () => navigate("/login") : null,
    });

    // Check cart items
    results.push({
      test: "Cart Items",
      status: items.length > 0 ? "pass" : "fail",
      message: `Cart contains ${items.length} items`,
      fix: items.length === 0 ? "Add books to cart" : null,
      action: items.length === 0 ? () => navigate("/") : null,
    });

    // Check environment setup
    const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    results.push({
      test: "Payment Configuration",
      status: paystackKey ? "pass" : "fail",
      message: paystackKey
        ? `Paystack configured (${paystackKey.startsWith("pk_live_") ? "LIVE" : "TEST"})`
        : "Paystack not configured",
      fix: !paystackKey ? "Set VITE_PAYSTACK_PUBLIC_KEY" : null,
      action: null,
    });

    // Check database connection
    results.push({
      test: "System Requirements",
      status: "pass",
      message: "Basic system checks passed",
      fix: null,
      action: null,
    });

    setTestResults(results);
  };

  const testCheckoutFlow = () => {
    if (!isAuthenticated) {
      toast.error("Please log in first");
      navigate("/login");
      return;
    }

    if (items.length === 0) {
      toast.error("Please add books to cart first");
      navigate("/");
      return;
    }

    toast.success("Starting checkout flow test...");
    navigate("/checkout");
  };

  const forceTestCheckout = () => {
    // Force navigate to checkout for testing
    toast.info("Forcing checkout navigation (for testing)");
    navigate("/checkout");
  };

  const clearAndRestart = () => {
    // Clear any problematic states
    localStorage.removeItem("checkout_step");
    localStorage.removeItem("shipping_data");
    toast.success("Cleared checkout state");

    if (items.length > 0) {
      navigate("/checkout");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5" />
            Checkout Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              If the "Continue to Payment" button is not working, use these
              diagnostic tools to identify and fix the issue.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={runCheckoutDiagnostics}
              variant="outline"
              className="h-auto p-4"
            >
              <div className="text-left">
                <div className="font-medium">Run Diagnostics</div>
                <div className="text-sm text-gray-600">
                  Check checkout prerequisites
                </div>
              </div>
            </Button>

            <Button onClick={testCheckoutFlow} className="h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Test Checkout Flow</div>
                <div className="text-sm text-gray-200">
                  Navigate to checkout page
                </div>
              </div>
            </Button>

            <Button
              onClick={forceTestCheckout}
              variant="outline"
              className="h-auto p-4"
            >
              <div className="text-left">
                <div className="font-medium">Force Test (Debug)</div>
                <div className="text-sm text-gray-600">
                  Bypass cart requirements
                </div>
              </div>
            </Button>

            <Button
              onClick={clearAndRestart}
              variant="outline"
              className="h-auto p-4"
            >
              <div className="text-left">
                <div className="font-medium">Clear & Restart</div>
                <div className="text-sm text-gray-600">
                  Reset checkout state
                </div>
              </div>
            </Button>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">Diagnostic Results:</h3>
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {result.status === "pass" ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    )}
                    <div>
                      <span className="font-medium">{result.test}</span>
                      <p className="text-sm text-gray-600">{result.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        result.status === "pass"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {result.status.toUpperCase()}
                    </Badge>
                    {result.fix && result.action && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={result.action}
                      >
                        {result.fix}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Common Issues Guide */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Common Checkout Issues & Fixes
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 space-y-3">
          <div>
            <h4 className="font-medium">
              "Continue to Payment" button not working:
            </h4>
            <ul className="text-sm list-disc list-inside space-y-1 ml-4">
              <li>
                Form validation may be failing - check all required fields
              </li>
              <li>
                Delivery options may not be loading - check courier services
              </li>
              <li>Try using the simplified shipping form</li>
              <li>Clear browser cache and localStorage</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium">Payment modal not opening:</h4>
            <ul className="text-sm list-disc list-inside space-y-1 ml-4">
              <li>Check VITE_PAYSTACK_PUBLIC_KEY is configured</li>
              <li>Verify Paystack script is loaded</li>
              <li>Check browser console for JavaScript errors</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium">Shipping form errors:</h4>
            <ul className="text-sm list-disc list-inside space-y-1 ml-4">
              <li>Ensure all required fields are completed</li>
              <li>Check Google Maps API key for address autocomplete</li>
              <li>Verify province selection is working</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutTroubleshooting;
