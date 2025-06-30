import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  Settings,
  Users,
  Receipt,
  Loader2,
  ExternalLink,
  Copy,
  RefreshCw,
  Database,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import PaystackPaymentService from "@/services/paystackPaymentService";
import { toast } from "sonner";
import PaystackConfigChecker from "./PaystackConfigChecker";
import { PaystackLibraryTest } from "@/utils/paystackLibraryTest";
import DevPaymentTester from "./DevPaymentTester";

const PaystackDashboard: React.FC = () => {
  const { user } = useAuth();
  const { items, getTotalPrice } = useCart();

  const [paystackStatus, setPaystackStatus] = useState<{
    configured: boolean;
    keyType: "live" | "test" | "none";
    scriptLoaded: boolean;
  }>({
    configured: false,
    keyType: "none",
    scriptLoaded: false,
  });

  const [testPayment, setTestPayment] = useState({
    amount: 10000, // R100 in kobo
    email: user?.email || "test@example.com",
    loading: false,
    status: "idle" as "idle" | "processing" | "success" | "error",
    message: "",
  });

  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [databaseTest, setDatabaseTest] = useState<{
    status: "idle" | "testing" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });

  // Check Paystack configuration on mount
  useEffect(() => {
    const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

    setPaystackStatus({
      configured: Boolean(
        paystackKey && paystackKey !== "pk_test_your-paystack-public-key-here",
      ),
      keyType: paystackKey?.startsWith("pk_live_")
        ? "live"
        : paystackKey?.startsWith("pk_test_")
          ? "test"
          : "none",
      scriptLoaded: Boolean((window as any).PaystackPop),
    });

    // Load Paystack script if not already loaded
    if (!(window as any).PaystackPop) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.onload = () => {
        setPaystackStatus((prev) => ({ ...prev, scriptLoaded: true }));
      };
      document.head.appendChild(script);
    }
  }, []);

  const handleTestPayment = async () => {
    if (!paystackStatus.configured) {
      toast.error("Paystack not configured");
      return;
    }

    setTestPayment((prev) => ({
      ...prev,
      loading: true,
      status: "processing",
    }));

    try {
      // Use the service's built-in loading mechanism
      console.log("Checking if Paystack is loaded...");
      const paystackLoaded =
        await PaystackPaymentService.ensurePaystackLoaded();

      if (!paystackLoaded) {
        throw new Error("Paystack library could not be loaded");
      }

      const reference = PaystackPaymentService.generateReference();
      console.log("Initializing test payment with reference:", reference);

      const result = await PaystackPaymentService.initializePayment({
        email: testPayment.email,
        amount: testPayment.amount,
        reference,
        metadata: {
          test_payment: true,
          user_id: user?.id,
          initiated_from: "paystack_dashboard",
        },
      });

      console.log("Payment result:", result);
      setTestPayment((prev) => ({
        ...prev,
        status: "success",
        message: `Test payment successful! Reference: ${reference}`,
      }));

      toast.success("Test payment completed successfully!");
    } catch (error) {
      console.error("Payment error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Payment failed";

      // Handle different types of errors
      if (
        errorMessage.includes("cancelled by user") ||
        errorMessage.includes("window was closed")
      ) {
        setTestPayment((prev) => ({
          ...prev,
          status: "idle",
          message: "",
        }));
        toast.info("Payment was cancelled");
      } else if (
        errorMessage.includes("not configured") ||
        errorMessage.includes("service unavailable")
      ) {
        setTestPayment((prev) => ({
          ...prev,
          status: "error",
          message:
            "Payment service configuration issue. Please contact support.",
        }));
        toast.error("Payment service not properly configured");
      } else {
        setTestPayment((prev) => ({
          ...prev,
          status: "error",
          message: errorMessage,
        }));
        toast.error(`Payment failed: ${errorMessage}`);
      }
    } finally {
      setTestPayment((prev) => ({ ...prev, loading: false }));
    }
  };

  const testDatabaseConnection = async () => {
    setDatabaseTest({
      status: "testing",
      message: "Testing database connection...",
    });

    try {
      // Run the debug function
      await PaystackPaymentService.debugOrdersTable();

      setDatabaseTest({
        status: "success",
        message: "Database connection successful! Check console for details.",
      });
      toast.success("Database test completed - check console for details");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Database test failed";
      setDatabaseTest({
        status: "error",
        message: errorMessage,
      });
      toast.error(`Database test failed: ${errorMessage}`);
    }
  };

  const loadOrderHistory = async () => {
    setLoadingOrders(true);
    try {
      // This would typically fetch from your orders table
      // For now, just simulate some data
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setOrderHistory([
        {
          id: "order_123",
          reference: "PSK_12345_abc",
          amount: 15000,
          status: "paid",
          created_at: new Date().toISOString(),
          buyer_email: "test@example.com",
        },
      ]);
    } catch (error) {
      toast.error("Failed to load order history");
    } finally {
      setLoadingOrders(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Development Mode Indicator */}
      <DevPaymentTester />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Paystack Dashboard
          </h2>
          <p className="text-gray-600">
            Test and manage Paystack payment integration
          </p>
        </div>
        <Badge
          variant={paystackStatus.keyType === "live" ? "default" : "secondary"}
          className={
            paystackStatus.keyType === "live"
              ? "bg-green-100 text-green-800"
              : paystackStatus.keyType === "test"
                ? "bg-blue-100 text-blue-800"
                : "bg-red-100 text-red-800"
          }
        >
          {paystackStatus.keyType === "live"
            ? "Live Mode"
            : paystackStatus.keyType === "test"
              ? "Test Mode"
              : "Not Configured"}
        </Badge>
      </div>

      {/* Configuration Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <StatusIcon
                status={paystackStatus.configured ? "success" : "error"}
              />
              <span className="text-sm">
                {paystackStatus.configured ? "Configured" : "Not Configured"}
              </span>
            </div>
            {paystackStatus.configured && (
              <p className="text-xs text-gray-500 mt-1">
                Key Type: {paystackStatus.keyType}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Script Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <StatusIcon
                status={paystackStatus.scriptLoaded ? "success" : "warning"}
              />
              <span className="text-sm">
                {paystackStatus.scriptLoaded ? "Loaded" : "Loading..."}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              User Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <StatusIcon status={user ? "success" : "warning"} />
              <span className="text-sm">
                {user ? "Authenticated" : "Not Authenticated"}
              </span>
            </div>
            {user && <p className="text-xs text-gray-500 mt-1">{user.email}</p>}
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="test-payment" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="test-payment">Test Payment</TabsTrigger>
          <TabsTrigger value="cart-checkout">Cart Checkout</TabsTrigger>
          <TabsTrigger value="order-history">Order History</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="test-payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Test Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="test-amount">Amount (in kobo)</Label>
                  <Input
                    id="test-amount"
                    type="number"
                    value={testPayment.amount}
                    onChange={(e) =>
                      setTestPayment((prev) => ({
                        ...prev,
                        amount: parseInt(e.target.value) || 0,
                      }))
                    }
                    placeholder="10000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    R{(testPayment.amount / 100).toFixed(2)} (100 kobo = R1)
                  </p>
                </div>
                <div>
                  <Label htmlFor="test-email">Email</Label>
                  <Input
                    id="test-email"
                    type="email"
                    value={testPayment.email}
                    onChange={(e) =>
                      setTestPayment((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="test@example.com"
                  />
                </div>
              </div>

              <Button
                onClick={handleTestPayment}
                disabled={!paystackStatus.configured || testPayment.loading}
                className="w-full"
              >
                {testPayment.loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Test Payment - R{(testPayment.amount / 100).toFixed(2)}
                  </>
                )}
              </Button>

              {testPayment.status !== "idle" && (
                <Alert
                  className={
                    testPayment.status === "success"
                      ? "border-green-200 bg-green-50"
                      : testPayment.status === "error"
                        ? "border-red-200 bg-red-50"
                        : "border-blue-200 bg-blue-50"
                  }
                >
                  <StatusIcon status={testPayment.status} />
                  <AlertDescription
                    className={
                      testPayment.status === "success"
                        ? "text-green-800"
                        : testPayment.status === "error"
                          ? "text-red-800"
                          : "text-blue-800"
                    }
                  >
                    {testPayment.message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cart-checkout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Cart Checkout Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span>Items in cart:</span>
                  <span>{items.length}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Total value:</span>
                  <span>R{(getTotalPrice() / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Status:</span>
                  <span>
                    {items.length > 0 ? "Ready for checkout" : "Empty cart"}
                  </span>
                </div>
              </div>

              {items.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="font-medium">Items in cart:</h4>
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between text-sm bg-white p-2 rounded border"
                    >
                      <span>{item.title}</span>
                      <span>R{(item.price / 100).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    Your cart is empty. Add some books to test the checkout
                    process.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => (window.location.href = "/")}
                  variant="outline"
                  className="flex-1"
                >
                  Browse Books
                </Button>
                <Button
                  onClick={() => (window.location.href = "/checkout")}
                  disabled={items.length === 0}
                  className="flex-1"
                >
                  Go to Checkout
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="order-history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Order History
                </div>
                <Button
                  onClick={loadOrderHistory}
                  disabled={loadingOrders}
                  size="sm"
                  variant="outline"
                >
                  {loadingOrders ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orderHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No orders found</p>
                  <p className="text-sm">
                    Orders will appear here after successful payments
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orderHistory.map((order, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">Order {order.id}</p>
                          <p className="text-sm text-gray-600">
                            {order.buyer_email}
                          </p>
                        </div>
                        <Badge
                          variant={
                            order.status === "paid" ? "default" : "secondary"
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Amount: R{(order.amount / 100).toFixed(2)}</span>
                        <button
                          onClick={() => copyToClipboard(order.reference)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        >
                          <Copy className="w-3 h-3" />
                          {order.reference}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <PaystackConfigChecker />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuration Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Environment</Label>
                  <div className="text-sm text-gray-600">
                    {import.meta.env.DEV ? "Development" : "Production"}
                  </div>
                </div>
                <div>
                  <Label>Public Key Status</Label>
                  <div className="text-sm text-gray-600">
                    {paystackStatus.configured ? "Configured" : "Missing"}
                  </div>
                </div>
                <div>
                  <Label>Key Type</Label>
                  <div className="text-sm text-gray-600">
                    {paystackStatus.keyType}
                  </div>
                </div>
                <div>
                  <Label>Script Loaded</Label>
                  <div className="text-sm text-gray-600">
                    {paystackStatus.scriptLoaded ? "Yes" : "No"}
                  </div>
                </div>
              </div>

              {!paystackStatus.configured && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Setup Required:</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>
                        Get your Paystack API keys from{" "}
                        <a
                          href="https://dashboard.paystack.com/#/settings/developers"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          Paystack Dashboard
                        </a>
                      </li>
                      <li>
                        Add <code>VITE_PAYSTACK_PUBLIC_KEY</code> to your
                        environment variables
                      </li>
                      <li>Restart the development server</li>
                      <li>Test the payment flow</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Environment Variables</h4>
                <div className="space-y-2 text-sm font-mono">
                  <div>
                    <span className="text-gray-600">
                      VITE_PAYSTACK_PUBLIC_KEY=
                    </span>
                    <span
                      className={
                        paystackStatus.configured
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {paystackStatus.configured
                        ? "pk_***...configured"
                        : "not_set"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-blue-800">
                  Integration Checklist
                </h4>
                <div className="space-y-2 text-sm text-blue-700">
                  <div className="flex items-center gap-2">
                    <StatusIcon
                      status={paystackStatus.configured ? "success" : "error"}
                    />
                    <span>Paystack keys configured</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon
                      status={
                        paystackStatus.scriptLoaded ? "success" : "warning"
                      }
                    />
                    <span>Paystack script loaded</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon status={user ? "success" : "warning"} />
                    <span>User authentication working</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon
                      status={
                        databaseTest.status === "success"
                          ? "success"
                          : databaseTest.status === "error"
                            ? "error"
                            : "warning"
                      }
                    />
                    <span>Database orders table accessible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon status="warning" />
                    <span>Webhook endpoint configured</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon status="warning" />
                    <span>Subaccounts and transfers tested</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Button
                    onClick={testDatabaseConnection}
                    disabled={databaseTest.status === "testing"}
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    {databaseTest.status === "testing" ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        Testing Database...
                      </>
                    ) : (
                      <>
                        <Database className="w-3 h-3 mr-2" />
                        Test Database Connection
                      </>
                    )}
                  </Button>

                  {databaseTest.status !== "idle" && (
                    <Alert
                      className={
                        databaseTest.status === "success"
                          ? "border-green-200 bg-green-50"
                          : "border-red-200 bg-red-50"
                      }
                    >
                      <StatusIcon status={databaseTest.status} />
                      <AlertDescription
                        className={
                          databaseTest.status === "success"
                            ? "text-green-800"
                            : "text-red-800"
                        }
                      >
                        {databaseTest.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaystackDashboard;
