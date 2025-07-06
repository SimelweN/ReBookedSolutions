import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  ShoppingCart,
  User,
  CreditCard,
  Database,
  MapPin,
  Truck,
  PlayCircle,
  Shield,
} from "lucide-react";
import ComprehensiveQAChecker from "@/components/ComprehensiveQAChecker";
import QAQuickFixes from "@/components/QAQuickFixes";
import CheckoutTroubleshooting from "@/components/CheckoutTroubleshooting";
import SystemwideQAFixes from "@/components/SystemwideQAFixes";
import GoogleMapsSetupHelper from "@/components/GoogleMapsSetupHelper";
import EnvironmentChecker from "@/components/EnvironmentChecker";
import PaystackDashboard from "@/components/PaystackDashboard";
import DevelopmentToolsDashboard from "@/components/DevelopmentToolsDashboard";

// Order System Test Components - Import dynamically to avoid issues
// import { testOrderSystem, checkDatabaseStatus } from "@/utils/testOrderSystem";

const SimpleQADashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  // Order System Test State
  const [orderTestResults, setOrderTestResults] = useState<any[]>([]);
  const [isRunningOrderTests, setIsRunningOrderTests] = useState(false);
  const [quickOrderStatus, setQuickOrderStatus] = useState<string>("");
  const [testResults, setTestResults] = useState<any[]>([]);

  const runQuickTest = () => {
    const results = [
      {
        name: "User Authentication",
        status: isAuthenticated ? "pass" : "fail",
        message: isAuthenticated
          ? "User is logged in"
          : "User not authenticated",
      },
      {
        name: "Cart System",
        status: items.length > 0 ? "pass" : "warning",
        message: `Cart has ${items.length} items`,
      },
      {
        name: "Paystack Config",
        status: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ? "pass" : "fail",
        message: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
          ? "Paystack key found"
          : "No Paystack key",
      },
      {
        name: "Google Maps",
        status: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? "pass" : "fail",
        message: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
          ? "Google Maps key found"
          : "No Google Maps key",
      },
    ];
    setTestResults(results);
  };

  // Order System Test Functions
  const runOrderSystemTests = async () => {
    setIsRunningOrderTests(true);
    setOrderTestResults([]);

    try {
      const results = await testOrderSystem();
      setOrderTestResults(results);
    } catch (error) {
      console.error("Order system tests failed:", error);
    } finally {
      setIsRunningOrderTests(false);
    }
  };

  const runQuickOrderCheck = async () => {
    setQuickOrderStatus("Running...");

    try {
      // Capture console output
      const originalLog = console.log;
      let output = "";
      console.log = (...args) => {
        output += args.join(" ") + "\n";
        originalLog(...args);
      };

      await checkDatabaseStatus();

      console.log = originalLog;
      setQuickOrderStatus(output);
    } catch (error) {
      setQuickOrderStatus(`Error: ${error.message}`);
    }
  };

  const getOrderTestStatusColor = (status: string) => {
    return status === "PASSED" ? "bg-green-500" : "bg-red-500";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "fail":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pass":
        return "text-green-800 bg-green-100";
      case "fail":
        return "text-red-800 bg-red-100";
      case "warning":
        return "text-yellow-800 bg-yellow-100";
      default:
        return "text-gray-800 bg-gray-100";
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            QA Dashboard - System Status
          </h1>
          <p className="text-gray-600">
            Quick system health check and testing tools
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Button
            onClick={() => navigate("/")}
            className="h-20 flex flex-col items-center justify-center bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ShoppingCart className="w-6 h-6 mb-1" />
            <span className="text-sm">Test Shopping</span>
          </Button>

          <Button
            onClick={() => navigate("/profile")}
            className="h-20 flex flex-col items-center justify-center bg-green-600 hover:bg-green-700 text-white"
          >
            <User className="w-6 h-6 mb-1" />
            <span className="text-sm">Profile Setup</span>
          </Button>

          <Button
            onClick={() => navigate("/checkout")}
            className="h-20 flex flex-col items-center justify-center bg-purple-600 hover:bg-purple-700 text-white"
          >
            <CreditCard className="w-6 h-6 mb-1" />
            <span className="text-sm">Test Checkout</span>
          </Button>

          <Button
            onClick={() => navigate("/paystack-test")}
            className="h-20 flex flex-col items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <CreditCard className="w-6 h-6 mb-1" />
            <span className="text-sm">Paystack Tests</span>
          </Button>

          <Button
            onClick={() => navigate("/admin")}
            className="h-20 flex flex-col items-center justify-center bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Settings className="w-6 h-6 mb-1" />
            <span className="text-sm">Admin Panel</span>
          </Button>
        </div>

        {/* System Status Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>System Health Check</span>
              <Button onClick={runQuickTest} variant="outline">
                Run Test
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Click "Run Test" to check system status
              </div>
            ) : (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">{result.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {result.message}
                      </span>
                      <Badge className={getStatusColor(result.status)}>
                        {result.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced QA Testing */}
        <Tabs defaultValue="devtools" className="w-full">
          <TabsList className="grid w-full grid-cols-11">
            <TabsTrigger value="devtools">Dev Tools</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="systemwide">Systemwide</TabsTrigger>
            <TabsTrigger value="environment">Environment</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="comprehensive">Tests</TabsTrigger>
            <TabsTrigger value="quickfixes">Fixes</TabsTrigger>
            <TabsTrigger value="checkout">Checkout</TabsTrigger>
            <TabsTrigger value="paystack">Paystack</TabsTrigger>
            <TabsTrigger value="maps">Maps</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
          </TabsList>

          <TabsContent value="devtools">
            <DevelopmentToolsDashboard />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <div className="grid gap-6">
              {/* Enhanced Order System Tests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Enhanced Order Management System Tests
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    Test all components of the enhanced order system including
                    48-hour commit system, notifications, and receipts.
                  </div>

                  {/* Quick Database Status Check */}
                  <div className="flex gap-2 mb-4">
                    <Button
                      onClick={runQuickOrderCheck}
                      variant="outline"
                      size="sm"
                    >
                      Quick Database Status
                    </Button>
                    <Button
                      onClick={runOrderSystemTests}
                      disabled={isRunningOrderTests}
                      size="sm"
                    >
                      {isRunningOrderTests
                        ? "Running Full Tests..."
                        : "Run Full Order System Tests"}
                    </Button>
                  </div>

                  {/* Quick Status Output */}
                  {quickOrderStatus && (
                    <div className="bg-muted p-3 rounded-lg">
                      <h4 className="font-medium mb-2">Database Status:</h4>
                      <pre className="text-sm whitespace-pre-wrap">
                        {quickOrderStatus}
                      </pre>
                    </div>
                  )}

                  {/* Full Test Results */}
                  {orderTestResults.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex gap-4 text-sm">
                        <span>Total: {orderTestResults.length}</span>
                        <span className="text-green-600">
                          Passed:{" "}
                          {
                            orderTestResults.filter(
                              (r) => r.status === "PASSED",
                            ).length
                          }
                        </span>
                        <span className="text-red-600">
                          Failed:{" "}
                          {
                            orderTestResults.filter(
                              (r) => r.status === "FAILED",
                            ).length
                          }
                        </span>
                      </div>

                      <div className="space-y-2">
                        {orderTestResults.map((result, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Badge
                                className={getOrderTestStatusColor(
                                  result.status,
                                )}
                              >
                                {result.status === "PASSED" ? "✅" : "❌"}{" "}
                                {result.status}
                              </Badge>
                              <span className="font-medium">{result.name}</span>
                            </div>

                            {result.result && (
                              <span className="text-sm text-muted-foreground">
                                {result.result}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Show errors if any */}
                      {orderTestResults.some((r) => r.error) && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <h4 className="font-medium text-red-800 mb-2">
                            Errors:
                          </h4>
                          <div className="space-y-1">
                            {orderTestResults
                              .filter((r) => r.error)
                              .map((result, index) => (
                                <div
                                  key={index}
                                  className="text-sm text-red-700"
                                >
                                  <strong>{result.name}:</strong> {result.error}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Test Information */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <h4 className="font-medium text-blue-800 mb-2">
                      What These Tests Check:
                    </h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h5 className="font-medium text-blue-700 mb-1">
                          Database Components
                        </h5>
                        <ul className="text-sm text-blue-600 space-y-1">
                          <li>• Database connection</li>
                          <li>• Enhanced orders table schema</li>
                          <li>• Order notifications table</li>
                          <li>• Receipts table</li>
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-medium text-blue-700 mb-1">
                          Functions & Features
                        </h5>
                        <ul className="text-sm text-blue-600 space-y-1">
                          <li>• 48-hour commit system</li>
                          <li>• Auto-cancel expired orders</li>
                          <li>• Send commit reminders</li>
                          <li>• Receipt generation</li>
                          <li>• Notification system</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Setup Instructions */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">
                      Setup Required:
                    </h4>
                    <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                      <li>Run the database migration in Supabase SQL Editor</li>
                      <li>Deploy the Edge Function for automated processing</li>
                      <li>Set up cron job for hourly order reminders</li>
                      <li>Update order components to use enhanced service</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="systemwide">
            <SystemwideQAFixes />
          </TabsContent>

          <TabsContent value="environment">
            <EnvironmentChecker />
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            {/* Current Status Display - moved from below */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {isAuthenticated ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">
                          Logged In
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-600">
                          Not Logged In
                        </span>
                      </>
                    )}
                  </div>
                  {user && (
                    <p className="text-xs text-gray-500 mt-1">
                      User ID: {user.id.slice(0, 8)}...
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Cart Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {items.length > 0 ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">
                          {items.length} items
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm text-yellow-600">
                          Empty cart
                        </span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Payment Config
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">
                          {import.meta.env.VITE_PAYSTACK_PUBLIC_KEY.startsWith(
                            "pk_live_",
                          )
                            ? "Live"
                            : "Test"}
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-600">
                          Not configured
                        </span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comprehensive">
            <ComprehensiveQAChecker />
          </TabsContent>

          <TabsContent value="quickfixes">
            <QAQuickFixes />
          </TabsContent>

          <TabsContent value="checkout">
            <CheckoutTroubleshooting />
          </TabsContent>

          <TabsContent value="paystack">
            <PaystackDashboard />
          </TabsContent>

          <TabsContent value="maps">
            <GoogleMapsSetupHelper />
          </TabsContent>

          <TabsContent value="checklist">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800 text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  QA Checklist - Critical Items
                </CardTitle>
              </CardHeader>
              <CardContent className="text-red-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">
                      🔐 Authentication & Profile
                    </h4>
                    <ul className="space-y-1">
                      <li>• User registration/login works</li>
                      <li>• Password reset flow functional</li>
                      <li>• Profile editing with Google Maps</li>
                      <li>• Address autocomplete (South Africa)</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">🛒 Cart & Checkout</h4>
                    <ul className="space-y-1">
                      <li>• Cart persists across sessions</li>
                      <li>• Checkout flow completes</li>
                      <li>• Courier options load (Fastway/Courier Guy)</li>
                      <li>• "Continue to Payment" button works</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">
                      💳 Paystack Integration
                    </h4>
                    <ul className="space-y-1">
                      <li>• LIVE keys configured (not test)</li>
                      <li>• Payment modal opens</li>
                      <li>• Split payments: 90% seller, 10% platform</li>
                      <li>• Webhook verification works</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">🧑‍💼 Seller Onboarding</h4>
                    <ul className="space-y-1">
                      <li>• Banking details required to sell</li>
                      <li>• Address required to sell</li>
                      <li>• "Become a Seller" guide works</li>
                      <li>• 48-hour timeout enforced</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SimpleQADashboard;
